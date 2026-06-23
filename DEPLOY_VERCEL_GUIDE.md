# Deploy DESPITE on Vercel

This project includes Vercel serverless API routes for Supabase email capture.

## 1. Push project to GitHub

Create a GitHub repo and upload this folder.

## 2. Import into Vercel

Go to:

https://vercel.com/new

Import your GitHub repo.

Vercel settings should auto-detect Vite. If needed:

- Framework Preset: Vite
- Build Command: `npm run vercel-build`
- Output Directory: `dist`

## 3. Add Environment Variables in Vercel

Go to:

Project Settings > Environment Variables

Add:

```env
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
SUPABASE_TABLE=despite_leads
ADMIN_PASSCODE=despite2026
```

Use your real Supabase Project URL and service_role key.

## 4. Deploy

Click Deploy.

## 5. Test

Open your Vercel URL, submit an email, then check:

Supabase > Table Editor > despite_leads

You should see the email.

Admin panel still uses:

```txt
#admin
```

Example:

```txt
https://your-site.vercel.app/#admin
```
