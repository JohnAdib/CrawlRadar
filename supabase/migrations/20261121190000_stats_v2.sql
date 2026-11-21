-- crawler_stats() v2: period-over-period deltas, referrals vs crawls, pages crawled,
-- AI traffic by type over time, referral sources, last-seen per bot, weekday x hour heatmap.
-- Mirrored in apps/web/lib/stats.ts (used for the home page demo and unit tests).

create or replace function public.crawler_stats(
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
  with window_bounds as (
    select p_since as since, p_since - (now() - p_since) as prev_since
  ),
  site_events as (
    select *
    from public.crawler_events
    where site_id = p_site_id
      and (p_platform is null or platform = p_platform)
      and (p_bot_type is null or bot_type = p_bot_type)
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
  )
  select jsonb_build_object(
    -- every platform ever seen for the site, unfiltered, to populate the filter dropdown
    'platforms', coalesce((
      select jsonb_agg(distinct platform order by platform)
      from public.crawler_events where site_id = p_site_id
    ), '[]'::jsonb),
    'total', (select count(*) from e),
    'crawls', (select count(*) from e where bot_type <> 'referral'),
    'prev_crawls', (select count(*) from prev where bot_type <> 'referral'),
    'referrals', (select count(*) from e where bot_type = 'referral'),
    'prev_referrals', (select count(*) from prev where bot_type = 'referral'),
    'active_bots', (select count(distinct bot_name) from e where bot_type <> 'referral'),
    'active_platforms', (select count(distinct platform) from e where bot_type <> 'referral'),
    'pages', (select count(distinct page_path) from e where bot_type <> 'referral'),
    -- fixed 24h/7d/30d crawler totals (FR-3.1): same filters, independent of p_since
    'totals', (
      select jsonb_build_object(
        '24h', count(*) filter (where "timestamp" >= now() - interval '24 hours'),
        '7d', count(*) filter (where "timestamp" >= now() - interval '7 days'),
        '30d', count(*)
      )
      from site_events
      where "timestamp" >= now() - interval '30 days' and bot_type <> 'referral'
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
    -- AI traffic over time, split by bot type (stacked chart)
    'timeline', (
      select jsonb_agg(
        jsonb_build_object(
          'bucket', b.bucket, 'visits', b.visits, 'training', b.training, 'search', b.search,
          'assistant', b.assistant, 'referral', b.referral, 'unknown', b.unknown
        ) order by b.bucket
      )
      from (
        select
          s.bucket,
          count(e.id) as visits,
          count(e.id) filter (where e.bot_type = 'training') as training,
          count(e.id) filter (where e.bot_type = 'search') as search,
          count(e.id) filter (where e.bot_type = 'assistant') as assistant,
          count(e.id) filter (where e.bot_type = 'referral') as referral,
          count(e.id) filter (where e.bot_type = 'unknown') as unknown
        from unit
          cross join generate_series(
            date_trunc(unit.u, p_since),
            date_trunc(unit.u, now()),
            ('1 ' || unit.u)::interval
          ) as s (bucket)
          left join e on date_trunc(unit.u, e."timestamp") = s.bucket
        group by s.bucket
      ) b
    ),
    -- when crawlers visit: ISO weekday (1 = Monday) x hour of day, UTC
    'heatmap', coalesce((
      select jsonb_agg(x order by x.dow, x.hour)
      from (
        select extract(isodow from "timestamp" at time zone 'utc')::int as dow,
               extract(hour from "timestamp" at time zone 'utc')::int as hour,
               count(*) as visits
        from e where bot_type <> 'referral' group by 1, 2
      ) x
    ), '[]'::jsonb)
  );
$$;
