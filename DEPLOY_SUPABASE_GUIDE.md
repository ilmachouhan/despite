# Deploy DESPITE with Supabase

## 1. Create Supabase table

Go to https://supabase.com/dashboard

Create a project, then open:

SQL Editor > New query

Paste everything from:

```txt
supabase/schema.sql
```

Click Run.

## 2. Get Supabase keys

Open:

Project Settings > API

Copy:

- Project URL
- service_role key

You will add these as environment variables in deployment.

## 3. Deploy on Render

Go to https://render.com

New > Web Service > connect your GitHub repo or upload project to GitHub.

Settings:

- Runtime: Node
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

Environment variables:

```env
NODE_ENV=production
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
SUPABASE_TABLE=despite_leads
```

Render gives you a public URL after deploy.

## 4. Local production test

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Add your real Supabase values, then:

```bash
npm install
npm run build
npm start
```

Open:

```txt
http://localhost:3000
```

Submit an email and check Supabase table `despite_leads`.
