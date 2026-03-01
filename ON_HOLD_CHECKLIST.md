# Putting BiteReserve on hold

When you cancel the BiteReserve Supabase project, the database (and Storage) are removed. The app will break unless you switch it to "hold mode" first. Follow this checklist **before** canceling Supabase.

---

## Before you cancel Supabase

### 1. Export your data (backup)

In the Supabase Dashboard:

1. Go to **Table Editor**.
2. For each table you care about, open it and use **Export to CSV** (or the overflow menu → Export).
3. Save the CSVs somewhere safe (e.g. a folder `bitereserve-backup-YYYY-MM-DD`).

**Tables to export (minimum):**

| Table | Why |
|-------|-----|
| `restaurants` | Core data for restaurant pages; needed to restore later. |
| `users` | If you want to restore owner accounts. |
| `campaign_links` | If you want to keep campaign link setup. |
| `subscriptions` | If you want to keep plan/history. |

Optional (for full restore): `analytics_events`, `analytics_daily_stats`, `monthly_usage`, `restaurant_emails`, `claim_*` tables if they exist.

**Alternative: SQL dump**

- In Supabase: **Settings → Database → Connection string** (URI).
- From your machine (with `psql` installed):  
  `pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" --no-owner --no-acl -f bitereserve-backup.sql`  
- Keep `bitereserve-backup.sql` and the password safe.

### 2. Save your environment variables

Copy these somewhere secure (e.g. a password manager or private doc). You’ll need them when you resume.

**From Vercel (or your host):**

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (if used)
- `STRIPE_SECRET_KEY` (if you use Stripe)
- `STRIPE_WEBHOOK_SECRET`
- Any other env vars your app uses (Resend, etc.)

You can also note: Supabase project ref, Stripe dashboard links, domain/DNS setup.

### 3. Enable hold mode so the site doesn’t break

**In Vercel (Project → Settings → Environment Variables):**

1. Add (or update):
   - **Name:** `NEXT_PUBLIC_HOLD_MODE`
   - **Value:** `true`
2. Apply to **Production** (and Preview if you want).
3. Redeploy the app so the new variable is used.

After this, bitereserve.com will show a static “BiteReserve is on hold” page and **will not call Supabase**. You can then safely cancel Supabase.

### 4. Cancel Supabase

- In Supabase: **Project Settings → General → Delete project** (or pause/cancel per your plan).
- After cancellation, the database and Storage are no longer available.

---

## Optional: reduce cost while on hold

- **Vercel:** You can leave the app deployed with hold mode on (minimal cost for one static page), or delete the project and point the domain to a single static “On hold” page elsewhere.
- **Stripe:** Cancel any active subscriptions or pause product if you don’t need payments during the hold.
- **Domain:** Keep the domain; you can point it back to Vercel when you resume.

---

## When you’re ready to resume

1. **Create a new Supabase project** (or re-subscribe to the old one if it was only paused).
2. **Run migrations** in the new project’s SQL Editor:
   - `database/schema.sql`
   - `database/create-increment-daily-stat.sql`
   - `database/create-restaurant-emails-table.sql`
   - Any other migration files you added.
3. **Import data** (if you have it):
   - From CSV: use Supabase Table Editor “Import” or your `import:csv` script if it fits.
   - From SQL dump: run the dump (or relevant parts) in the SQL Editor, adjusting schema if needed.
4. **Update env vars** in Vercel with the new project’s:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. **Turn off hold mode:** set `NEXT_PUBLIC_HOLD_MODE` to `false` (or remove it) and redeploy.
6. Reconfigure Stripe webhooks to point to the same or updated endpoint if needed.

After that, the app and restaurant pages will run again against the new Supabase project.
