# LM Coin Wallet

A crypto trading and wallet platform for LM Coin. Users can register, log in, buy/sell/trade LM Coin, manage their INR and LMC balances, view transaction history, and refer friends.

## Stack

- **Frontend / SSR**: React 19 + TanStack Start (TanStack Router with server-side rendering)
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix UI components)
- **Backend / DB**: Supabase (Postgres + Auth + Row-Level Security)
- **Payments**: Razorpay integration (server-side order creation in `src/server.ts`)
- **Build**: Vite 8 via `@lovable.dev/vite-tanstack-config`

## Running the app

```bash
npm run dev        # start dev server on port 5000
npm run build      # production build (outputs to Nitro/Cloudflare)
npm run lint       # ESLint
npm run format     # Prettier
```

The **"Start application"** workflow runs `npm run dev` and serves on port 5000.

## Key environment variables

Stored in `.env` (already present):

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay payment keys (optional — falls back to mock order IDs if absent) |

## Project structure

```
src/
  routes/          # TanStack file-based routes (index = login, dashboard, wallet, buy, sell, trade, …)
  components/      # Shared UI components (lmc/ for app-specific, ui/ for shadcn primitives)
  integrations/    # Supabase client + Lovable auth
  lib/             # Auth security helpers, error capture, etc.
  hooks/           # Custom React hooks
  assets/          # Static assets (logo, etc.)
supabase/
  migrations/      # SQL migrations (profiles, wallets, transactions, price_ticks, …)
```

## User preferences

- Keep the existing project structure and stack — do not restructure or migrate.
