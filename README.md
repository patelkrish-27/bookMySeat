# BookMySeat 🎬

A full-stack movie ticket booking application — search movies, pick seats, pay with Razorpay, and receive a styled HTML confirmation email.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4 |
| Backend | Spring Boot 4, Spring Security (JWT), Spring Data JPA |
| Database | PostgreSQL (Supabase) |
| Cache / Locks | Redis (Upstash in production) |
| Payments | Razorpay |
| Email | Gmail SMTP + Thymeleaf HTML templates |
| Auth | Email + OTP verification, JWT (Bearer) |

---

## Features

- Browse movies, view showtimes by theater and city
- Interactive seat map with REGULAR / PREMIUM / RECLINER tiers
- 8-minute Redis-backed tentative seat hold (race-condition safe)
- Razorpay payment with server-side HMAC signature verification
- Idempotent payment confirmation (replay-safe via Idempotency-Key)
- Styled HTML movie-ticket email sent on booking confirmation
- Admin dashboard — manage movies, theaters, screens (with seat map builder), and shows
- JWT authentication with email OTP verification
- Booking history (upcoming / past)
- Expired seat-lock cleanup scheduler (runs every 60 s)

---

## Repository Layout

```
bookMySeat/
├── backend/bookmyseat/   # Spring Boot application
│   ├── src/main/java/…   # Controllers, services, entities, repositories
│   └── src/main/resources/
│       ├── application.properties          # ← NOT committed (uses env vars)
│       ├── application.properties.example  # ← Commit this — template for devs
│       └── templates/booking-confirmation.html
└── fronted/              # React + Vite application
    ├── src/
    │   ├── pages/        # Page-level components
    │   ├── components/   # Shared components (Nav, MovieCard)
    │   ├── lib/api.ts    # Typed API client
    │   ├── context/      # AuthContext (JWT storage)
    │   └── types/        # Shared TypeScript types
    ├── .env.example      # ← Commit this — template for devs
    └── .env              # ← NOT committed (your local secrets)
```

---

## Local Development

### Prerequisites

- Java 17+
- Maven 3.9+
- Node 20+ and pnpm (`npm i -g pnpm`)
- PostgreSQL (or a free [Supabase](https://supabase.com) project)
- Redis (Docker is the easiest: `docker run -d -p 6379:6379 redis:7`)

### 1 — Clone

```bash
git clone https://github.com/<your-username>/bookMySeat.git
cd bookMySeat
```

### 2 — Backend config

```bash
cd backend/bookmyseat/src/main/resources
cp application.properties.example application.properties
# Open application.properties and fill in every <placeholder>
```

Minimum required values for local dev:

| Key | Where to get it |
|---|---|
| `DB_URL` | Your Postgres JDBC URL, e.g. `jdbc:postgresql://localhost:5432/bookmyseat` |
| `DB_USERNAME` | Postgres user |
| `DB_PASSWORD` | Postgres password |
| `JWT_SECRET` | Run `openssl rand -base64 32` |
| `MAIL_USERNAME` | Gmail address |
| `MAIL_PASSWORD` | 16-char Google App Password |
| `RAZORPAY_KEY_ID` | Razorpay test key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay test key secret |

Redis runs on `localhost:6379` by default — no config change needed if using Docker above.

### 3 — Run the backend

```bash
cd backend/bookmyseat
./mvnw spring-boot:run
# Server starts on http://localhost:8080
# Swagger UI: http://localhost:8080/docs
```

### 4 — Frontend config

```bash
cd fronted
cp .env.example .env
# .env already points to http://localhost:8080 — no change needed for local dev
```

### 5 — Run the frontend

```bash
cd fronted
pnpm install
pnpm dev
# App opens at http://localhost:8443
```

### 6 — Admin login

On first startup the backend creates a default admin account:

- **Email:** `admin@bookmyseat.com`  
- **Password:** `admin123`

Change these via `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars before deploying.

---

## Environment Variables Reference

### Backend

| Variable | Required | Description |
|---|---|---|
| `DB_URL` | ✅ | JDBC connection string |
| `DB_USERNAME` | ✅ | Database user |
| `DB_PASSWORD` | ✅ | Database password |
| `JWT_SECRET` | ✅ | Base64 secret (≥ 32 bytes) |
| `JWT_EXPIRATION_MS` | — | Token TTL in ms (default 3600000) |
| `MAIL_USERNAME` | ✅ | Gmail address for sending emails |
| `MAIL_PASSWORD` | ✅ | Gmail App Password (16 chars) |
| `REDIS_HOST` | ✅ | Redis hostname (default localhost) |
| `REDIS_PORT` | ✅ | Redis port (default 6379) |
| `REDIS_PASSWORD` | — | Redis password (required for Upstash) |
| `REDIS_SSL` | — | `true` for Upstash TLS (default false) |
| `RAZORPAY_KEY_ID` | ✅ | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | ✅ | Razorpay key secret |
| `ADMIN_EMAIL` | — | Bootstrap admin email |
| `ADMIN_PASSWORD` | — | Bootstrap admin password |

### Frontend

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | ✅ | Backend URL, no trailing slash |

---

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for a complete step-by-step guide to deploying on:

- **Supabase** — managed PostgreSQL
- **Upstash** — serverless Redis
- **Render** — Spring Boot backend (free tier)
- **Vercel** — React frontend (free tier)
