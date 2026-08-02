# Deployment Guide

This guide deploys BookMySeat for free using four cloud services:

| Service | What it hosts | Free tier |
|---|---|---|
| [Supabase](https://supabase.com) | PostgreSQL database | 500 MB, 2 CPU |
| [Upstash](https://upstash.com) | Redis (seat locking) | 10 000 req/day |
| [Render](https://render.com) | Spring Boot backend | 512 MB RAM (sleeps after 15 min inactivity) |
| [Vercel](https://vercel.com) | React frontend | Unlimited static hosting |

> **Note on Render's free tier** — the backend spins down after 15 minutes of inactivity and takes ~30 s to wake up on the first request. Upgrade to a paid Render plan ($7/mo) to avoid cold starts in production.

---

## Prerequisites

- [Git](https://git-scm.com/) installed
- A [GitHub](https://github.com) account (repo must be pushed there first)
- Accounts on Supabase, Upstash, Render, and Vercel (all free with GitHub login)

---

## Step 1 — Push to GitHub

### 1.1 Create the repo on GitHub

1. Go to https://github.com/new
2. Name it `bookMySeat`, choose **Private** (recommended while in dev), click **Create repository**. Do NOT initialise with README — you already have one.

### 1.2 Add remote and push

```bash
# From the project root (bookMySeat/)
git remote add origin https://github.com/<your-username>/bookMySeat.git
git branch -M main

# Stage everything except what .gitignore blocks
git add .
git status   # review — confirm application.properties and .env are NOT listed

git commit -m "feat: initial full-stack BookMySeat application"
git push -u origin main
```

> **Double-check before pushing:** `git status` must NOT show `application.properties` or any `.env` file in the staged list. If they appear, run `git rm --cached <file>` to untrack them.

---

## Step 2 — Supabase (PostgreSQL)

### 2.1 Create a project

1. https://app.supabase.com → **New project**
2. Choose a name (e.g. `bookmyseat`), set a strong DB password, pick the region closest to your users, click **Create project** (~2 min to provision).

### 2.2 Get the connection string

1. **Project Settings** (gear icon) → **Database**
2. Under **Connection string**, select the **Transaction mode** tab (port **6543** — needed for PgBouncer pooling)
3. Copy the URI, it looks like:
   ```
   postgresql://postgres.<project-ref>:<password>@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   ```
4. Convert to JDBC format for Spring:
   ```
   jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:6543/postgres?prepareThreshold=0
   ```
   Keep your `username` (the part before the `@` in the URI, e.g. `postgres.<project-ref>`) and the password handy.

> The `?prepareThreshold=0` query param disables server-side prepared statements, which are not supported through PgBouncer in transaction mode.

### 2.3 Note your credentials

```
DB_URL      = jdbc:postgresql://<host>:6543/postgres?prepareThreshold=0
DB_USERNAME = postgres.<project-ref>
DB_PASSWORD = <your-db-password>
```

---

## Step 3 — Upstash (Redis)

### 3.1 Create a database

1. https://console.upstash.com → **Create Database**
2. Name it `bookmyseat-redis`, choose **Regional**, pick a region, enable **TLS**, click **Create**.

### 3.2 Get connection details

From the database detail page, under **REST API** or **Details**:

```
REDIS_HOST     = <region>.upstash.io
REDIS_PORT     = 6379
REDIS_PASSWORD = <your-upstash-password>
REDIS_SSL      = true
```

---

## Step 4 — Render (Spring Boot Backend)

### 4.1 Generate a production JWT secret

Run this locally — you need a new, strong secret:

```bash
openssl rand -base64 32
# Example output: 7kP2mQ9xRvBnLpYwZsDcFhJtUeOaGiNk1234567890ab=
```

Copy the output — you'll paste it as `JWT_SECRET` in the next step.

### 4.2 Create a Web Service on Render

1. https://dashboard.render.com → **New** → **Web Service**
2. Connect your GitHub account and select the `bookMySeat` repository
3. Fill in the service settings:

| Field | Value |
|---|---|
| **Name** | `bookmyseat-api` |
| **Region** | Closest to your users |
| **Branch** | `main` |
| **Root Directory** | `backend/bookmyseat` |
| **Runtime** | `Java` |
| **Build Command** | `./mvnw clean package -DskipTests` |
| **Start Command** | `java -jar target/bookmyseat-0.0.1-SNAPSHOT.jar` |
| **Instance Type** | Free |

### 4.3 Add environment variables

In the **Environment** tab of your new Render service, add each variable:

| Variable | Value |
|---|---|
| `DB_URL` | `jdbc:postgresql://<supabase-host>:6543/postgres?prepareThreshold=0` |
| `DB_USERNAME` | `postgres.<project-ref>` |
| `DB_PASSWORD` | your Supabase DB password |
| `JWT_SECRET` | output of `openssl rand -base64 32` |
| `JWT_EXPIRATION_MS` | `3600000` |
| `MAIL_USERNAME` | your Gmail address |
| `MAIL_PASSWORD` | your 16-char Gmail App Password |
| `REDIS_HOST` | `<region>.upstash.io` |
| `REDIS_PORT` | `6379` |
| `REDIS_PASSWORD` | your Upstash password |
| `REDIS_SSL` | `true` |
| `RAZORPAY_KEY_ID` | your Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | your Razorpay key secret |
| `ADMIN_EMAIL` | your admin email |
| `ADMIN_PASSWORD` | a strong admin password |

Click **Create Web Service**. Render will build and deploy (~5 min on first deploy).

### 4.4 Note your backend URL

After deployment, Render gives you a URL like:

```
https://bookmyseat-api.onrender.com
```

Keep this — you'll need it for the frontend env variable.

### 4.5 Verify the deployment

```bash
curl https://bookmyseat-api.onrender.com/api/v1/search/movies
# Should return [] or a JSON array of movies
```

---

## Step 5 — Vercel (React Frontend)

### 5.1 Import the project

1. https://vercel.com/new → **Import Git Repository**
2. Select your `bookMySeat` repo
3. Vercel will auto-detect Vite. Configure:

| Field | Value |
|---|---|
| **Framework Preset** | `Vite` |
| **Root Directory** | `fronted` |
| **Build Command** | `pnpm run build` (or leave as default `vite build`) |
| **Output Directory** | `dist` |
| **Install Command** | `pnpm install` |

### 5.2 Add environment variable

Under **Environment Variables** before deploying:

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://bookmyseat-api.onrender.com` |

Click **Deploy** (~1 min).

### 5.3 Note your frontend URL

```
https://bookmyseat.vercel.app   (or whatever Vercel assigns)
```

---

## Step 6 — Configure CORS on the Backend

Your backend currently allows all origins for development. For production, restrict CORS to your Vercel domain.

Open `backend/bookmyseat/src/main/java/com/example/bookmyseat/config/CorsConfig.java` and update `allowedOrigins`:

```java
configuration.setAllowedOrigins(List.of(
    "http://localhost:8443",                      // local dev
    "https://bookmyseat.vercel.app"               // your Vercel URL
));
```

Then add a `FRONTEND_URL` env variable on Render and read it dynamically, or hardcode your Vercel URL. Commit and push — Render redeploys automatically.

---

## Step 7 — Configure Razorpay Webhook (Optional but Recommended)

For production, configure a Razorpay webhook so payments are confirmed even if the user closes the browser mid-flow.

1. Razorpay Dashboard → **Settings** → **Webhooks** → **Add New Webhook**
2. **Webhook URL:** `https://bookmyseat-api.onrender.com/api/v1/payments/webhook`
3. **Active Events:** `payment.captured`
4. Copy the **Webhook Secret** — store it as `RAZORPAY_WEBHOOK_SECRET` on Render

> The webhook handler is a future enhancement. For now, the `/confirm` endpoint handles post-payment confirmation client-side.

---

## Step 8 — Go Live Checklist

Before sharing the URL publicly, verify each item:

```
[ ] git status shows application.properties and .env are NOT tracked
[ ] Backend /api/v1/search/movies returns data (Supabase connected)
[ ] Admin login works at /admin with your ADMIN_EMAIL / ADMIN_PASSWORD
[ ] Create a test movie, theater, screen, and show through admin panel
[ ] Complete a test booking end-to-end (use Razorpay test card: 4111 1111 1111 1111)
[ ] Confirmation email arrives in your inbox after payment
[ ] CORS is locked to your Vercel domain (not wildcard *)
[ ] spring.jpa.show-sql=false in production (already set in application.properties)
[ ] spring.jpa.hibernate.ddl-auto=validate (change from "update" once schema is stable)
```

---

## Razorpay Test Cards

Use these during end-to-end testing (test mode only):

| Card | Number | CVV | Expiry |
|---|---|---|---|
| Visa (success) | `4111 1111 1111 1111` | Any 3 digits | Any future date |
| Mastercard (success) | `5267 3181 8797 5449` | Any 3 digits | Any future date |
| Failure simulation | `4000 0000 0000 0002` | Any | Any |

---

## Troubleshooting

### Backend not starting on Render

- Check **Logs** in the Render dashboard
- Common cause: missing env variable. Render shows `Could not resolve placeholder '${VAR}'`
- Fix: add the missing variable under **Environment** and click **Manual Deploy**

### Redis connection refused

- Confirm `REDIS_SSL=true` and `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` are all set
- Upstash free-tier databases expire after 30 days of inactivity — recreate if needed

### Emails not sending

- Verify `MAIL_PASSWORD` is a **Google App Password** (16 chars, no spaces), not your Gmail login password
- Gmail → Account → Security → 2-Step Verification must be ON before App Passwords appear
- Check Render logs for `Failed to send ... email` — that log line includes the error message

### Frontend shows "Could not reach backend"

- Confirm `VITE_API_BASE_URL` on Vercel matches your exact Render URL (no trailing slash)
- Redeploy the Vercel project after updating the env variable (Vercel bakes env vars into the static bundle at build time)

### Supabase connection pool exhausted

- Switch `spring.datasource.hikari.maximum-pool-size` to `3` or `5` (Supabase free tier allows 60 connections total; the pooler handles the rest)
- Add to `application.properties`: `spring.datasource.hikari.maximum-pool-size=${DB_POOL_SIZE:5}`
