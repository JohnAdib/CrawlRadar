-- v4: search-engine crawlers as their own type, an install signal for onboarding,
-- crawler traffic per platform over time, and the full list of crawled pages.

-- 1. Search engines (Googlebot, Bingbot, ...) are stored, but kept out of "AI" totals.
alter table public.crawler_events drop constraint crawler_events_bot_type_check;
alter table public.crawler_events add constraint crawler_events_bot_type_check
  check (bot_type in ('training', 'search', 'assistant', 'referral', 'search_engine', 'unknown'));

-- 2. When the snippet was first seen working on the site. Set by the `track` function on the
-- first hit from the site's own domain (human or bot), or by the onboarding check.
alter table public.sites add column installed_at timestamptz;
update public.sites s
set installed_at = (select min("timestamp") from public.crawler_events e where e.site_id = s.id);

-- Owners may set installed_at (onboarding check) and nothing else on an existing site.
revoke update on public.sites from authenticated;
grant update (installed_at) on public.sites to authenticated;
create policy "Users can mark own sites installed" on public.sites
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- 3. Dashboard aggregates. Same signature as v3; adds search engines and platform_timeline.
create or replace function public.crawler_stats(
  p_site_id uuid,
  p_since timestamptz,
  p_platform text default null,
  p_bot_type text default null,
  p_page_path text default null
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with window_bounds as (
    select p_since as since, p_since - (now() - p_since) as prev_since
  ),
  site_events as (
    select *, bot_type not in ('referral', 'search_engine') as is_ai
    from public.crawler_events
    where site_id = p_site_id
      and (p_platform is null or platform = p_platform)
      and (p_bot_type is null or bot_type = p_bot_type)
      and (p_page_path is null or page_path = p_page_path)
  ),
  e as (
    select * from site_events, window_bounds where "timestamp" >= window_bounds.since
  ),
  prev as (
    select * from site_events, window_bounds
    where "timestamp" >= window_bounds.prev_since and "timestamp" < window_bounds.since
  ),
  unit as (
    select case when p_since > now() - interval '25 hours' then 'hour' else 'day' end as u
  ),
  buckets as (
    select s.bucket, unit.u
    from unit cross join generate_series(
      date_trunc(unit.u, p_since), date_trunc(unit.u, now()), ('1 ' || unit.u)::interval
    ) as s (bucket)
  )
  select jsonb_build_object(
    -- every platform ever seen for the site, unfiltered, to populate the filter dropdown
    'platforms', coalesce((
      select jsonb_agg(distinct platform order by platform)
      from public.crawler_events where site_id = p_site_id
    ), '[]'::jsonb),
    'total', (select count(*) from e),
    'crawls', (select count(*) from e where is_ai),
    'prev_crawls', (select count(*) from prev where is_ai),
    'referrals', (select count(*) from e where bot_type = 'referral'),
    'prev_referrals', (select count(*) from prev where bot_type = 'referral'),
    'search_engine_visits', (select count(*) from e where bot_type = 'search_engine'),
    'active_bots', (select count(distinct bot_name) from e where is_ai),
    'active_platforms', (select count(distinct platform) from e where is_ai),
    'pages', (select count(distinct page_path) from e where is_ai),
    -- fixed 24h/7d/30d AI crawler totals (FR-3.1): same filters, independent of p_since
    'totals', (
      select jsonb_build_object(
        '24h', count(*) filter (where "timestamp" >= now() - interval '24 hours'),
        '7d', count(*) filter (where "timestamp" >= now() - interval '7 days'),
        '30d', count(*)
      )
      from site_events
      where "timestamp" >= now() - interval '30 days' and is_ai
    ),
    'by_platform', coalesce((
      select jsonb_agg(x order by x.visits desc, x.platform)
      from (select platform, count(*) as visits from e group by platform) x
    ), '[]'::jsonb),
    'referrers', coalesce((
      select jsonb_agg(x order by x.visits desc, x.source)
      from (
        select bot_name as source, platform, count(*) as visits
        from e where bot_type = 'referral' group by 1, 2
      ) x
    ), '[]'::jsonb),
    'by_bot', coalesce((
      select jsonb_agg(x order by x.visits desc, x.bot_name)
      from (
        select bot_name, platform, bot_type, count(*) as visits, max("timestamp") as last_seen
        from e group by 1, 2, 3
      ) x
    ), '[]'::jsonb),
    'top_pages', coalesce((
      select jsonb_agg(x order by x.visits desc, x.page_path)
      from (
        select page_path, count(*) as visits from e
        group by page_path order by visits desc, page_path limit 10
      ) x
    ), '[]'::jsonb),
    -- all traffic over time, split by bot type (stacked chart)
    'timeline', (
      select jsonb_agg(
        jsonb_build_object(
          'bucket', b.bucket, 'visits', b.visits, 'training', b.training, 'search', b.search,
          'assistant', b.assistant, 'referral', b.referral,
          'search_engine', b.search_engine, 'unknown', b.unknown
        ) order by b.bucket
      )
      from (
        select
          buckets.bucket,
          count(e.id) as visits,
          count(e.id) filter (where e.bot_type = 'training') as training,
          count(e.id) filter (where e.bot_type = 'search') as search,
          count(e.id) filter (where e.bot_type = 'assistant') as assistant,
          count(e.id) filter (where e.bot_type = 'referral') as referral,
          count(e.id) filter (where e.bot_type = 'search_engine') as search_engine,
          count(e.id) filter (where e.bot_type = 'unknown') as unknown
        from buckets
          left join e on date_trunc(buckets.u, e."timestamp") = buckets.bucket
        group by buckets.bucket
      ) b
    ),
    -- crawler visits (no referrals) per platform over time; only non-empty buckets
    'platform_timeline', coalesce((
      select jsonb_agg(x order by x.bucket, x.platform)
      from (
        select buckets.bucket, e.platform, count(*) as visits
        from buckets
          join e on date_trunc(buckets.u, e."timestamp") = buckets.bucket
        where e.bot_type <> 'referral'
        group by 1, 2
      ) x
    ), '[]'::jsonb),
    -- when AI crawlers visit: ISO weekday (1 = Monday) x hour of day, UTC
    'heatmap', coalesce((
      select jsonb_agg(x order by x.dow, x.hour)
      from (
        select extract(isodow from "timestamp" at time zone 'utc')::int as dow,
               extract(hour from "timestamp" at time zone 'utc')::int as hour,
               count(*) as visits
        from e where is_ai group by 1, 2
      ) x
    ), '[]'::jsonb)
  );
$$;

-- 4. Every crawled page in range (Pages view), most visited first.
create or replace function public.crawler_pages(
  p_site_id uuid,
  p_since timestamptz,
  p_platform text default null,
  p_bot_type text default null
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(jsonb_agg(x order by x.visits desc, x.page_path), '[]'::jsonb)
  from (
    select
      page_path,
      count(*) as visits,
      count(*) filter (where bot_type not in ('referral', 'search_engine')) as ai_visits,
      count(*) filter (where bot_type = 'referral') as referrals,
      count(distinct bot_name) filter (where bot_type <> 'referral') as bots,
      mode() within group (order by platform) as top_platform,
      max("timestamp") as last_seen
    from public.crawler_events
    where site_id = p_site_id
      and "timestamp" >= p_since
      and (p_platform is null or platform = p_platform)
      and (p_bot_type is null or bot_type = p_bot_type)
    group by page_path
    order by visits desc, page_path
    limit 500
  ) x;
$$;

grant execute on function public.crawler_pages (uuid, timestamptz, text, text) to authenticated;
