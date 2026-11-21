-- Add fixed 24h / 7d / 30d totals to crawler_stats() for the dashboard overview.

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
    -- every platform ever seen for the site, unfiltered, to populate the filter dropdown
    'platforms', coalesce((
      select jsonb_agg(distinct platform order by platform)
      from public.crawler_events where site_id = p_site_id
    ), '[]'::jsonb),
    'total', (select count(*) from e),
    -- fixed 24h/7d/30d totals (FR-3.1): same platform/type filters, independent of p_since
    'totals', (
      select jsonb_build_object(
        '24h', count(*) filter (where "timestamp" >= now() - interval '24 hours'),
        '7d', count(*) filter (where "timestamp" >= now() - interval '7 days'),
        '30d', count(*)
      )
      from public.crawler_events
      where site_id = p_site_id
        and "timestamp" >= now() - interval '30 days'
        and (p_platform is null or platform = p_platform)
        and (p_bot_type is null or bot_type = p_bot_type)
    ),
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
