# SolarACA — Railway Deployment Guide

## 1. Database Setup

In Railway, provision a **MySQL** plugin and run the migration:

```bash
# Option A: Run via Railway CLI
railway run mysql -u root -p < drizzle/migrations/init.sql

# Option B: Connect with any MySQL client using Railway's connection string
mysql -h HOST -P PORT -u USER -pPASSWORD DATABASE < drizzle/migrations/init.sql
```

This creates all 7 tables and seeds testimonials + training modules.

---

## 2. Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project (or use existing)
3. Enable **Google+ API** (or People API)
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add Authorized redirect URI:
   ```
   https://YOUR-APP.railway.app/api/oauth/callback
   ```
7. Copy **Client ID** and **Client Secret** → set as Railway env vars

---

## 3. Railway Environment Variables

Set these in Railway → Your Service → Variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Auto-set by Railway MySQL plugin |
| `JWT_SECRET` | Generate: `openssl rand -hex 32` |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `ADMIN_EMAIL` | Your Google email — gets dashboard access |

Optional (messaging):

| Variable | Value |
|---|---|
| `TWILIO_ACCOUNT_SID` | From Twilio console |
| `TWILIO_AUTH_TOKEN` | From Twilio console |
| `TWILIO_PHONE_NUMBER` | E.164 format e.g. +15551234567 |
| `RESEND_API_KEY` | [Resend](https://resend.com) — **preferred**; candidates get “application received” after `/apply` when this or SendGrid is set |
| `RESEND_FROM_EMAIL` | Verified domain in Resend (or Resend’s test sender if applicable) |
| `RESEND_FROM_NAME` | Optional display name |
| `SENDGRID_API_KEY` | Fallback if `RESEND_API_KEY` is unset |
| `SENDGRID_FROM_EMAIL` | Verified sender in SendGrid |
| `SENDGRID_FROM_NAME` | Optional display name |
| `CALENDLY_API_KEY` | From Calendly integrations page (optional) |

**Resumes (no AWS required):** When `BUILT_IN_FORGE_API_URL` + `BUILT_IN_FORGE_API_KEY` are set (Manus/WebDev storage proxy), uploads work and **View Resume** uses the returned URL. You **do not** need Google/Manus for **login** — that uses **Google OAuth** only.

---

## 4. Deployment

Railway auto-deploys on every push to `main`. Build command and start command are in `package.json`:

```json
"build": "vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
"start": "NODE_ENV=production node dist/index.js"
```

Railway will pick these up automatically.

---

## 5. First Login

1. Visit `https://your-app.railway.app/dashboard`
2. Click **Sign in with Google**
3. Sign in with the email matching `ADMIN_EMAIL`
4. You'll land on the dashboard with full admin access

Any other Google account gets `user` role (access to apply page only) until you invite them.

### Team admins & roles

1. Sign in as the **`ADMIN_EMAIL`** account (always **super admin**).
2. Open **Team & permissions** (`/dashboard/settings`).
3. **Invite** a colleague’s **Google email** and pick a **role**:
   - **Super admin** — full access + can manage invites (same as owner for app features; owner in `ADMIN_EMAIL` cannot be revoked here).
   - **Manager / Recruiter** — pipeline, resumes, comms, interviews, internal notifications (no team management).
   - **Viewer** — view pipeline, resumes, and interview info; cannot change status, send messages, or schedule interviews.
4. They **Sign in with Google** once; OAuth grants dashboard access from the pending invite.

Fine-grained flags are defined in `shared/permissions.ts`. Migration adds `users.adminTier`, `users.adminPermissions`, and table `staffGrants`.

---

## 6. Verify It's Working

- `/` — Landing page loads
- `/apply` — Application funnel works, submits to DB
- `/dashboard` → Sign in with Google → Kanban board shows
- `/dashboard/settings` → Team invites (super admins only)
- `/api/trpc/applicants.stats` → Returns JSON (not an error)
