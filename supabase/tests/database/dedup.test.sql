-- Each page view is counted once, whichever install methods report it. Run with: pnpm db:test
-- record_hit() is what the `track` function calls for the script, the pixel and server-side.
begin;
create extension if not exists pgtap with schema extensions;
select plan(17);

insert into auth.users (id, email, aud, role) values
  ('cccccccc-0000-0000-0000-000000000003', 'carol@example.test', 'authenticated', 'authenticated'),
  ('dddddddd-0000-0000-0000-000000000004', 'dave@example.test', 'authenticated', 'authenticated');
insert into public.sites (id, user_id, domain) values
  ('c3c3c3c3-0000-0000-0000-000000000003', 'cccccccc-0000-0000-0000-000000000003', 'dedup.test'),
  ('d4d4d4d4-0000-0000-0000-000000000004', 'dddddddd-0000-0000-0000-000000000004', 'other.test');

-- Shorthand: one GPTBot hit on dedup.test from `source`, for `path`.
create function pg_temp.hit(source text, path text, ua text default 'GPTBot/1.2', ip text default 'ip-1')
returns text language sql as $$
  select public.record_hit(
    'c3c3c3c3-0000-0000-0000-000000000003', source, ua, 'GPTBot', 'OpenAI', 'training',
    'https://dedup.test' || path, path, null, ip
  )
$$;
create function pg_temp.visits(path text) returns int language sql as $$
  select count(*)::int from public.crawler_events
  where site_id = 'c3c3c3c3-0000-0000-0000-000000000003' and page_path = path
$$;

-- Hybrid plus server-side: the server reports the request, then the script runs.
select is(pg_temp.hit('server', '/a'), 'recorded', 'the server reports a visit');
select is(pg_temp.hit('script', '/a'), 'duplicate', 'the script for the same view is folded in');
select is(
  (select sources from public.crawler_events where page_path = '/a'),
  array['server', 'script'],
  'one row, reported by both methods'
);
-- A separate pixel next to the script: also the same view.
select is(pg_temp.hit('pixel', '/a'), 'duplicate', 'a pixel on the same page is folded in too');
select is(pg_temp.visits('/a'), 1, 'all three methods: counted once');

-- The same crawler visits again: a second visit, and its script joins that one.
select is(pg_temp.hit('server', '/a'), 'recorded', 'a second server report is a second visit');
select is(pg_temp.hit('script', '/a'), 'duplicate', 'and its script report joins it');
select is(pg_temp.visits('/a'), 2, 'two visits, each counted once');

-- Order doesn't matter, and the IP doesn't have to match (IPv4 vs IPv6).
select is(pg_temp.hit('script', '/b', ip => 'ip-v4'), 'recorded', 'the script can arrive first');
select is(pg_temp.hit('server', '/b', ip => 'ip-v6'), 'duplicate', 'then the server, from another IP');

-- Different pages and different crawlers are different visits.
select is(pg_temp.hit('script', '/c'), 'recorded', 'another page is another visit');
select is(pg_temp.hit('script', '/a', ua => 'ClaudeBot/1.0'), 'recorded', 'another crawler is another visit');

-- Five minutes later it is a new visit.
update public.crawler_events set "timestamp" = now() - interval '6 minutes' where page_path = '/c';
select is(pg_temp.hit('server', '/c'), 'recorded', 'a report after 5 minutes is a new visit');

-- Never across sites.
select is(
  public.record_hit(
    'd4d4d4d4-0000-0000-0000-000000000004', 'server', 'GPTBot/1.2', 'GPTBot', 'OpenAI',
    'training', 'https://other.test/a', '/a', null, 'ip-1'
  ),
  'recorded',
  'the same page path on another site is its own visit'
);

-- Only the track function (service role) can record hits; owners can set their server key.
select set_config('role', 'authenticated', true);
select set_config(
  'request.jwt.claims',
  json_build_object('sub', 'cccccccc-0000-0000-0000-000000000003', 'role', 'authenticated')::text,
  true
);
select throws_ok(
  $$ select pg_temp.hit('server', '/x') $$,
  '42501', null,
  'a signed-in user cannot call record_hit'
);
select lives_ok(
  $$ update public.sites set server_key_hash = repeat('a', 64)
     where id = 'c3c3c3c3-0000-0000-0000-000000000003' $$,
  'an owner can set their server key'
);
update public.sites set server_key_hash = repeat('b', 64)
where id = 'd4d4d4d4-0000-0000-0000-000000000004';
reset role;
select is(
  (select server_key_hash from public.sites where id = 'd4d4d4d4-0000-0000-0000-000000000004'),
  null,
  'but not the key of someone else''s site'
);

select * from finish();
rollback;
