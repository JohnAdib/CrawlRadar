# Contributing to CrawlRadar

Thanks for helping. Bug reports, new bot signatures and pull requests are all welcome.

## Setup

Follow the [local quick start](README.md#quick-start-local-about-5-minutes): `pnpm install`, `pnpm db:start`, copy the env file, `pnpm dev`.

## Before opening a pull request

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

CI runs the same checks.

- **Schema changes:** add a new file under `supabase/migrations/` (`pnpm exec supabase migration new <name>`). Never edit a migration that has already shipped. Then regenerate types with `pnpm exec supabase gen types typescript > apps/web/lib/database.types.ts`.
- **New UI components:** add them to the shared design system with `pnpm dlx shadcn@latest add <component>` from `apps/web`. They land in `packages/ui`.
- **New bots:** see [Adding a bot](README.md#adding-a-bot).

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(track): detect Amazonbot
fix(web): keep filters when switching sites
docs: clarify Vercel root directory
```

Common types are `feat`, `fix`, `docs`, `refactor`, `test` and `chore`. Common scopes are `web`, `ui`, `track` and `db`.
