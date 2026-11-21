-- Tenant isolation tests for row-level security. Run with: pnpm db:test
-- Two users both add the same domain; neither can see, change or inject the other's data.
begin;
create extension if not exists pgtap with schema extensions;
select plan(21);

-- Two users, created inside this transaction (rolled back at the end).
insert into auth.users (id, email, aud, role) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'alice@example.test', 'authenticated', 'authenticated'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'bob@example.test', 'authenticated', 'authenticated');

-- Helper: act as a signed-in user, like PostgREST does for a request with their JWT.
create function pg_temp.act_as(uid uuid) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
$$;

-- Alice adds test.com.
select pg_temp.act_as('aaaaaaaa-0000-0000-0000-000000000001');
select lives_ok(
  $$ insert into public.sites (id, domain) values ('a1a1a1a1-0000-0000-0000-000000000001', 'test.com') $$,
  'alice can add test.com'
);

-- Bob adds the same domain: allowed, but it is a separate site with its own ID.
select pg_temp.act_as('bbbbbbbb-0000-0000-0000-000000000002');
select lives_ok(
  $$ insert into public.sites (id, domain) values ('b2b2b2b2-0000-0000-0000-000000000002', 'test.com') $$,
  'bob can add the same domain as a separate site'
);
select throws_ok(
  $$ insert into public.sites (domain) values ('test.com') $$,
  '23505', null,
  'one user cannot add the same domain twice'
);

-- Traffic arrives for Alice's site (written by the track function with the service role).
reset role;
insert into public.crawler_events (site_id, user_agent, bot_name, platform, bot_type, page_url, page_path)
select 'a1a1a1a1-0000-0000-0000-000000000001', 'GPTBot/1.2', 'GPTBot', 'OpenAI', 'training', 'https://test.com/secret', '/secret'
from generate_series(1, 5);

-- Bob sees only his own site and none of Alice's events.
select pg_temp.act_as('bbbbbbbb-0000-0000-0000-000000000002');
select is((select count(*) from public.sites)::int, 1, 'bob sees only his own site');
select is(
  (select id from public.sites),
  'b2b2b2b2-0000-0000-0000-000000000002'::uuid,
  'the site bob sees is his, not alice''s'
);
select is((select count(*) from public.crawler_events)::int, 0, 'bob sees no events at all');
select is(
  (select count(*) from public.crawler_events where site_id = 'a1a1a1a1-0000-0000-0000-000000000001')::int,
  0,
  'bob cannot read alice''s events even by site id'
);
select is(
  (public.crawler_stats('a1a1a1a1-0000-0000-0000-000000000001', now() - interval '30 days', null, null, null)->>'total')::int,
  0,
  'the stats function returns nothing for someone else''s site'
);
select is(
  public.crawler_pages('a1a1a1a1-0000-0000-0000-000000000001', now() - interval '30 days'),
  '[]'::jsonb,
  'the pages function returns nothing for someone else''s site'
);

-- Bob cannot write into or take over Alice's data.
select throws_ok(
  $$ insert into public.crawler_events (site_id, user_agent, bot_name, platform, bot_type, page_url)
     values ('b2b2b2b2-0000-0000-0000-000000000002', 'x', 'x', 'x', 'unknown', 'https://test.com/') $$,
  '42501', null,
  'users cannot insert events directly, even for their own site'
);
select throws_ok(
  $$ insert into public.sites (domain, user_id) values ('evil.com', 'aaaaaaaa-0000-0000-0000-000000000001') $$,
  '42501', null,
  'bob cannot create a site owned by alice'
);
delete from public.sites where id = 'a1a1a1a1-0000-0000-0000-000000000001';
select throws_ok(
  $$ update public.sites set domain = 'stolen.com' where id = 'a1a1a1a1-0000-0000-0000-000000000001' $$,
  '42501', null,
  'bob cannot rename alice''s site'
);
update public.sites set installed_at = now() where id = 'a1a1a1a1-0000-0000-0000-000000000001';

-- Alice still has everything.
select pg_temp.act_as('aaaaaaaa-0000-0000-0000-000000000001');
select is((select count(*) from public.sites)::int, 1, 'alice still has her site after bob tried to delete it');
select is((select domain from public.sites), 'test.com', 'alice''s site was not renamed by bob');
select is((select installed_at from public.sites), null, 'bob cannot mark alice''s site installed');
select lives_ok(
  $$ update public.sites set installed_at = now() where id = 'a1a1a1a1-0000-0000-0000-000000000001' $$,
  'alice can mark her own site installed'
);
select throws_ok(
  $$ update public.sites set domain = 'other.com' where id = 'a1a1a1a1-0000-0000-0000-000000000001' $$,
  '42501', null,
  'a site''s domain cannot be changed after it is added'
);
select is((select count(*) from public.crawler_events)::int, 5, 'alice sees her 5 events');
select is(
  (public.crawler_stats('a1a1a1a1-0000-0000-0000-000000000001', now() - interval '30 days', null, null, null)->>'total')::int,
  5,
  'alice''s stats count her events'
);

-- Signed-out (anon) requests see nothing.
reset role;
set local role anon;
select is((select count(*) from public.sites)::int, 0, 'anonymous users see no sites');
select is((select count(*) from public.crawler_events)::int, 0, 'anonymous users see no events');

select * from finish();
rollback;
