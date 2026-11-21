-- CrawlRadar schema: sites a user tracks, and the AI crawler hits recorded for them.

create table public.sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  domain text not null check (domain ~ '^[a-z0-9.-]+$'),
  created_at timestamptz not null default now(),
  unique (user_id, domain)
);

create table public.crawler_events (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  "timestamp" timestamptz not null default now(),
  user_agent text not null,
  bot_name varchar(100) not null,
  platform varchar(50) not null,
  bot_type varchar(20) not null
    check (bot_type in ('training', 'search', 'assistant', 'referral', 'unknown')),
  page_url text not null,
  page_path varchar(500),
  referrer text,
  ip_hash varchar(64)
);

create index idx_events_site_time on public.crawler_events (site_id, "timestamp" desc);
create index idx_events_platform on public.crawler_events (platform);

-- Row level security: users only ever see their own sites and events.
-- Events are written by the `track` Edge Function with the service role, so there is no insert policy.
alter table public.sites enable row level security;
alter table public.crawler_events enable row level security;

create policy "Users can view own sites" on public.sites
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "Users can add own sites" on public.sites
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "Users can delete own sites" on public.sites
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can view own events" on public.crawler_events
  for select to authenticated
  using (site_id in (select id from public.sites where user_id = (select auth.uid())));

-- Dashboard aggregates in one round trip. `security invoker` keeps RLS in force.
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
  with e as (
    select *
    from public.crawler_events
    where site_id = p_site_id
      and "timestamp" >= p_since
      and (p_platform is null or platform = p_platform)
      and (p_bot_type is null or bot_type = p_bot_type)
  ),
  unit as (
    select case when p_since > now() - interval '25 hours' then 'hour' else 'day' end as u
  )
  select jsonb_build_object(
    'total', (select count(*) from e),
    'active_bots', (select count(distinct bot_name) from e),
    'by_platform', coalesce((
      select jsonb_agg(x order by x.visits desc)
      from (select platform, count(*) as visits from e group by platform) x
    ), '[]'::jsonb),
    'by_bot', coalesce((
      select jsonb_agg(x order by x.visits desc)
      from (select bot_name, platform, bot_type, count(*) as visits from e group by 1, 2, 3) x
    ), '[]'::jsonb),
    'top_pages', coalesce((
      select jsonb_agg(x order by x.visits desc)
      from (
        select page_path, count(*) as visits from e
        group by page_path order by visits desc limit 10
      ) x
    ), '[]'::jsonb),
    'timeline', (
      select jsonb_agg(jsonb_build_object('bucket', b.bucket, 'visits', b.visits) order by b.bucket)
      from (
        select s.bucket, count(e.id) as visits
        from unit
          cross join generate_series(
            date_trunc(unit.u, p_since),
            date_trunc(unit.u, now()),
            ('1 ' || unit.u)::interval
          ) as s (bucket)
          left join e on date_trunc(unit.u, e."timestamp") = s.bucket
        group by s.bucket
      ) b
    )
  );
$$;

grant execute on function public.crawler_stats (uuid, timestamptz, text, text) to authenticated;
