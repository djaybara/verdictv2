# QuickVerdict – Starter

Zero-config starter for Next.js (App Router, TS) + Clerk + Neon + Drizzle + Tailwind.

## Quick start

1) Install deps
```bash
npm i
```
2) Create `.env.local` from `.env.example` and fill keys (Clerk + Neon).
3) Run Drizzle migrations
```bash
npx drizzle-kit generate
npx drizzle-kit push
```
4) Dev
```bash
npm run dev
```

Open http://localhost:3000
- Sign in: http://localhost:3000/sign-in
- Create questions via POST /api/questions (UI coming next)

Deploy on Vercel and set the same env vars (+ `NEXT_PUBLIC_APP_URL`).
