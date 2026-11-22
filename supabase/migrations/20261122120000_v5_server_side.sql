-- v5: server-side tracking, and every page view counted once across install methods.

-- 1. Which install methods reported each visit: 'script', 'pixel' and/or 'server'.
-- A page view seen by several methods is one row with several sources.
alter table public.crawler_events
  add column sources text[] not null default '{}'
  check (sources <@ array['script', 'pixel', 'server']);

-- 2. A secret key per site for server-side tracking. Only its SHA-256 hash is stored:
-- the key itself is shown once, when it is created.
alter table public.sites
  add column server_key_hash text unique check (server_key_hash ~ '^[0-9a-f]{64}$');

-- Owners may set installed_at and their server key, and nothing else on an existing site.
grant update (installed_at, server_key_hash) on public.sites to authenticated;

-- 3. Records one hit, or folds it into the page view another method already reported.
-- A hit is the same view as an event for the same site, page and user agent from the last
-- 5 minutes that this method hasn't reported yet. So Hybrid plus server-side, or a script plus
-- a separate pixel, count each page view once, while two real visits (two reports from the
-- same method) stay two. The IP isn't required to match: a browser can reach your site over
-- IPv6 and CrawlRadar over IPv4. When several events qualify, the one from the same IP wins.
create function public.record_hit(
  p_site_id uuid,
  p_source text,
  p_user_agent text,
  p_bot_name text,
  p_platform text,
  p_bot_type text,
  p_page_url text,
  p_page_path text,
  p_referrer text,
  p_ip_hash text
)
returns text -- 'recorded' (a new visit) or 'duplicate' (folded into one)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
begin
  -- One hit at a time per page and user agent, so two methods arriving together can't both
  -- insert.
  perform pg_advisory_xact_lock(
    hashtextextended(p_site_id::text || coalesce(p_page_path, '') || p_user_agent, 0)
  );

  select id into v_id
  from public.crawler_events
  where site_id = p_site_id
    and page_path is not distinct from p_page_path
    and user_agent = p_user_agent
    and "timestamp" > now() - interval '5 minutes'
    and not (p_source = any (sources))
  order by ip_hash is not distinct from p_ip_hash desc, "timestamp" desc
  limit 1;

  if v_id is not null then
    update public.crawler_events
    set sources = array_append(sources, p_source),
      referrer = coalesce(referrer, p_referrer)
    where id = v_id;
    return 'duplicate';
  end if;

  insert into public.crawler_events (
    site_id, sources, user_agent, bot_name, platform, bot_type,
    page_url, page_path, referrer, ip_hash
  )
  values (
    p_site_id, array[p_source], p_user_agent, p_bot_name, p_platform, p_bot_type,
    p_page_url, p_page_path, p_referrer, p_ip_hash
  );
  return 'recorded';
end;
$$;

-- Only the `track` Edge Function (service role) records hits.
revoke execute on function public.record_hit (
  uuid, text, text, text, text, text, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.record_hit (
  uuid, text, text, text, text, text, text, text, text, text
) to service_role;
