## Pharmago Frontend (Next.js 15 / App Router)

Supplier dashboard frontend built with Next.js 15, React 19, Tailwind CSS v4, TanStack Query, Redux Toolkit, and Pusher for realtime updates. Internationalized (ar, en, es, fr).

### Requirements
- Node 20+
- Yarn

### Quick start
1) Install dependencies
```bash
yarn
```

2) Environment
Create a `.env.local` with:
```bash
NEXT_PUBLIC_SUPPLIER_URL=http://localhost:8000
NEXT_PUBLIC_PUSHER_APP_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=eu
```

3) Run
```bash
yarn dev
# opens http://localhost:3000
```

### Scripts
- `yarn dev` — start Next.js dev server
- `yarn build` — production build
- `yarn start` — start production server
- `yarn lint` — run Next.js lint
- `yarn add-translation` — scaffold keys in all locales
- `yarn test-translations` — validate missing/extra translation keys

### i18n
- Translations in `translations/{ar,en,es,fr}.json`
- App utilities in `lib/i18n.ts`, API i18n in `lib/api-i18n.ts`
- See `docs/i18n-guide.md` and `README-i18n.md`

### API and Auth
- Axios configured in `config/api.ts` with `NEXT_PUBLIC_SUPPLIER_URL`
- Requests attach Bearer token via interceptors (see `lib/api` and `lib/server-auth`)
- Ensure Laravel backend Sanctum/CORS settings are configured for `localhost:3000`

### Realtime (Pusher)
- Config in `config/pusher.ts`
- Client usage examples in `components/providers/PusherProvider.tsx` and `docs/pusher-integration.md`

### Build/Deploy
- Next.js config at `next.config.ts` (images, CORS headers, ignoring type/lint errors in build)
- Tailwind v4 config with `tailwind.config.ts` and PostCSS v4

### Troubleshooting
- 401s: confirm cookies/token available and backend `SANCTUM_STATEFUL_DOMAINS` includes `localhost:3000`
- CORS: backend `FRONTEND_URL` and frontend `NEXT_PUBLIC_SUPPLIER_URL` must match the dev hosts

