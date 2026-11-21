-- Local demo data. Runs on `supabase db reset` (local only, never in production).
-- Demo login: demo@crawlradar.dev / crawlradar-demo (60 days of data, so every range has a previous period)

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated', 'demo@crawlradar.dev',
  extensions.crypt('crawlradar-demo', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
);

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (
  gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"demo@crawlradar.dev"}', 'email', now(), now(), now()
);

insert into public.sites (id, user_id, domain, created_at, installed_at)
values ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'crawlradar.vercel.app', now() - interval '61 days', now() - interval '60 days');

with bots (bot_name, platform, bot_type, user_agent, referrer, w) as (
  values
    ('GPTBot', 'OpenAI', 'training', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot', null, 30),
    ('OAI-SearchBot', 'OpenAI', 'search', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot', null, 12),
    ('ChatGPT-User', 'OpenAI', 'assistant', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot', null, 10),
    ('ClaudeBot', 'Anthropic', 'training', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)', null, 22),
    ('Claude-User', 'Anthropic', 'assistant', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +Claude-User@anthropic.com)', null, 6),
    ('PerplexityBot', 'Perplexity', 'search', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)', null, 14),
    ('Google-Extended', 'Google', 'training', 'Mozilla/5.0 (compatible; Google-Extended)', null, 8),
    ('Meta-ExternalAgent', 'Meta', 'training', 'meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)', null, 9),
    ('Bytespider', 'Bytedance', 'training', 'Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; Bytespider; spider-feedback@bytedance.com)', null, 7),
    ('CCBot', 'Common Crawl', 'training', 'CCBot/2.0 (https://commoncrawl.org/faq/)', null, 5),
    ('Applebot-Extended', 'Apple', 'training', 'Mozilla/5.0 (compatible; Applebot-Extended/0.1)', null, 3),
    ('DeepSeekBot', 'DeepSeek', 'training', 'Mozilla/5.0 (compatible; DeepSeekBot/1.0; +https://www.deepseek.com/bot)', null, 3),
    ('Kimi-User', 'Moonshot AI', 'assistant', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Kimi-User/1.0)', null, 2),
    ('Googlebot', 'Google', 'search_engine', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', null, 10),
    ('Bingbot', 'Microsoft', 'search_engine', 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)', null, 5),
    ('SomeNewAIcrawler', 'Unknown', 'unknown', 'Mozilla/5.0 (compatible; SomeNewAIcrawler/0.3; +https://example.com/bot)', null, 4),
    ('ChatGPT', 'OpenAI', 'referral', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0 Safari/537.36', 'https://chatgpt.com/', 8),
    ('Perplexity', 'Perplexity', 'referral', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Safari/605.1.15', 'https://www.perplexity.ai/', 4),
    ('Claude', 'Anthropic', 'referral', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0 Safari/537.36', 'https://claude.ai/', 3),
    ('Gemini', 'Google', 'referral', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0 Safari/537.36', 'https://gemini.google.com/', 2)
),
pages (page_path, w) as (
  values ('/', 20), ('/pricing', 12), ('/blog/ai-search-guide', 15), ('/blog/llms-txt-explained', 10),
         ('/docs/getting-started', 9), ('/docs/api', 7), ('/about', 4), ('/blog/robots-txt-for-ai', 8),
         ('/changelog', 3), ('/contact', 2)
)
insert into public.crawler_events (site_id, "timestamp", user_agent, bot_name, platform, bot_type, page_url, page_path, referrer, ip_hash)
select
  '22222222-2222-2222-2222-222222222222',
  now() - power(random(), 1.6) * interval '60 days',
  b.user_agent, b.bot_name, b.platform, b.bot_type,
  'https://crawlradar.vercel.app' || p.page_path, p.page_path, b.referrer,
  md5(random()::text) || md5(random()::text)
from generate_series(1, 5000) g
-- weighted random pick per row (exponential trick); `g > 0` makes the subquery re-run per row
cross join lateral (select * from bots where g > 0 order by -ln(random()) / w limit 1) b
cross join lateral (select * from pages where g > 0 order by -ln(random()) / w limit 1) p;
