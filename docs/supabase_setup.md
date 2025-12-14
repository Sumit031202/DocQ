# Phase 1: Supabase Setup Instructions

## 1. Create Supabase Project
1.  Go to [database.new](https://database.new) and sign in.
2.  Click **"New Project"**.
3.  Enter a name (e.g., `DocQ`).
4.  Set a strong database password (save this!).
5.  Choose a region close to you.
6.  Click **"Create new project"**.

## 2. Get Project Credentials
1.  Once the project is created (takes ~1-2 mins), go to **Project Settings** (cog icon) -> **API**.
2.  Copy the **Project URL**.
3.  Copy the **anon public** key.

## 3. Enable Realtime
1.  Go to **Database** (sidebar) -> **Replication**.
2.  Click **"0 tables"** (Source) or check if `supabase_realtime` publication exists.
3.  We will enable replication for specific tables (like `queue`) later via SQL, but ensure the feature is on.
    *   *Note: By default, new projects usually have realtime enabled, but we must explicitly enable it for tables.*

## 4. Auth Settings
1.  Go to **Authentication** -> **Providers**.
2.  Ensure **Email** is enabled.
3.  (Optional) Disable "Confirm email" for faster testing:
    *   Go to **Authentication** -> **URL Configuration** (or Site URL).
    *   Or **Providers** -> **Email** -> **Confirm email** (toggle off).

## 5. Environment Variables
Create a file named `.env` (or `.env.local` for Vite) in your project root and add:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```
