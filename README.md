# YDM – KOL Management System

ระบบจัดการ KOL และแคมเปญ (Next.js + Supabase)

## Tech stack

- **Framework:** Next.js 16 (App Router)
- **Database / Auth:** Supabase (PostgreSQL, RLS, Auth)
- **UI:** React, Tailwind CSS, Radix UI
- **Language:** TypeScript

## Project structure

```
├── app/                 # Next.js App Router (routes, layouts, API)
├── components/          # React components (ui/ = shared UI, rest = feature)
├── lib/                 # Shared utilities, Supabase client, config
├── scripts/             # DB migrations (SQL), runnable scripts (TS/Shell)
├── public/              # Static assets
├── docs/                # Documentation
│   ├── *.md             # Guides, setup, troubleshooting
│   ├── sql/             # One-off SQL (quick fixes, checks)
│   └── examples/        # Example / test assets
├── middleware.ts        # Next.js middleware (auth session)
├── package.json
└── README.md
```

## Getting started

1. **Install**
   ```bash
   pnpm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env.local` (create `.env.example` if missing).
   - Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` (for scripts).

3. **Database**
   - Run migrations from `scripts/` (see `scripts/README.md`).
   - Or use Supabase Dashboard SQL Editor with the migration files.

4. **Run**
   ```bash
   pnpm dev
   ```

## Scripts

| Command | Description |
|--------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm test:supabase` | Test Supabase connection |
| `pnpm check:tables` | Check DB tables |

Details for SQL migrations and one-off scripts: **scripts/README.md**.

## Documentation

- **docs/** – Setup guides, troubleshooting, module notes.
- **docs/sql/** – Ad-hoc SQL (fixes, checks).
- **docs/examples/** – Example / test files.

## License

Private.
