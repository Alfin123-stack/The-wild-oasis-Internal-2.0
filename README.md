# 🏝️ The Wild Oasis
_An internal hotel dashboard for managing cabin bookings, built with **Next.js**, **React**, and **MongoDB**._

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![Styled Components](https://img.shields.io/badge/Styled_Components-6-pink?logo=styledcomponents)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-red?logo=reactquery)
![Auth.js](https://img.shields.io/badge/Auth.js-v5-purple)

---

## 📖 Overview

**The Wild Oasis** is a **staff-only web app** for a small cabin hotel. Front-desk staff use it to take bookings, check guests in and out, and keep an eye on occupancy and revenue. Managers get extra tools to set prices, manage staff accounts, and review activity.

There is no public sign-up. Accounts are created by an admin, and every page except Sign in requires a login.

The interface uses a warm lodge look (cream, bronze, navy, serif headings) with status colors that tell staff what needs action.

---

## ✨ Features

- 🔑 **Staff Accounts** → Sign in with email and password (Auth.js). Two roles: `admin` and `staff`. Deactivated users are blocked immediately.
- 📅 **Bookings** → Create, search, filter, cancel, delete (with Undo), and export to CSV. Prices, nights, and date conflicts are always calculated on the server.
- 🗓 **Timeline** → Every cabin, day by day, with quick actions on each booking bar.
- 🛎 **Check-in / Check-out** → A 4-step check-in (guest details, extras, payment, confirm) with a clear warning if the arrival date is not today.
- 🏡 **Cabins** → Cards with today's status, photos, discounts, duplicate, and archive. A cabin with current or upcoming bookings cannot be archived.
- 👥 **Guests** → Searchable guest list with contact details and booking history.
- 📊 **Dashboard** → KPIs, sales vs. previous period, length-of-stay chart, today's arrivals, in-house guests, and departures.
- 🤖 **Assistant (optional)** → Ask about bookings in plain words, get a short answer plus the table of rows behind it. Also a weekly report and price suggestions. Read-only.
- 🔎 **Command Palette** → `Ctrl+K` to jump to any page, guest, or booking.
- 🧾 **Activity Log** → Admins can see who did what, and when.
- 🌗 **Light and Dark Themes** → Responsive from phone to desktop, with accessible contrast.

---

## 🏗 Tech Stack

**Frontend**
- Next.js 15 (App Router)
- React 19
- styled-components
- TanStack Query
- React Hook Form
- Recharts

**Backend**
- Next.js Route Handlers
- MongoDB Atlas + Mongoose
- Auth.js v5 (Credentials, JWT)
- Zod (input validation)
- Cloudinary (cabin photos and avatars)

**AI (optional)**
- Google Gemini through function calling (`gemini-2.5-flash` by default, with automatic fallback models)

**Tooling**
- ESLint (`next lint`)
- Self-hosted fonts: IBM Plex Sans, IBM Plex Mono, Source Serif 4

---

## ⚡ Getting Started

### ✅ Prerequisites
- Node.js `>= 20`
- A MongoDB Atlas database
- A Cloudinary account (for images)
- A Gemini API key (optional, only for the Assistant)

### 📥 Installation
```bash
git clone <your-repo-url>
cd the-wild-oasis-next
npm install
```

### 🔐 Environment
Copy `.env.example` to `.env.local` and fill it in.

| Variable | Description |
|---|---|
| `MONGODB_URI` | Atlas connection string. Include the database name before the `?`, e.g. `.../wild-oasis?retryWrites=true&w=majority` |
| `AUTH_SECRET` | Session secret. Generate one with `openssl rand -base64 32` |
| `AUTH_URL` | App URL (`http://localhost:3000` locally, your real domain in production) |
| `AUTH_TRUST_HOST` | `true` |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | From the Cloudinary console |
| `GEMINI_API_KEY` | Optional. Enables the Assistant |
| `GEMINI_MODEL` | Optional. Defaults to `gemini-2.5-flash` |
| `GEMINI_FALLBACK_MODELS` | Optional. Comma-separated models to try if the main one is busy or missing |
| `AI_ENABLED` | Set to `false` to turn the Assistant off |

> Never commit `.env.local`. Keep API keys on the server only.

### ▶️ Run the app
```bash
npm run seed -- --yes     # sample data + 3 sample accounts (development only)
npm run dev               # http://localhost:3000
```

### 👤 Create your own admin (no seed)
```bash
npm run create-admin -- "Full Name" email@example.com
```

### 🌱 Sample data
`npm run seed -- --yes` fills the database with 8 cabins, 30 guests, about 130 bookings, and default settings. Booking dates are relative to today, so the dashboard always has something to show.

| Account | Role |
|---|---|
| `admin@wildoasis.com` | admin |
| `sari@wildoasis.com` | staff |
| `budi@wildoasis.com` | staff |

The default password is `wildoasis123` (or the value of `SEED_PASSWORD`).

> ⚠️ **Never run the seed on a production database.** It deletes existing data and creates sample accounts. It refuses to run without `--yes`, and in production it refuses to run without `SEED_PASSWORD`.

---

## 👥 Roles

| Action | Staff | Admin |
|---|:--:|:--:|
| Create, cancel, and look up bookings | ✅ | ✅ |
| Check guests in and out | ✅ | ✅ |
| Manage guests | ✅ | ✅ |
| Use the Assistant (ask) | ✅ | ✅ |
| Delete bookings | ❌ | ✅ |
| Add, edit, archive, or delete cabins | ❌ | ✅ |
| Change settings and prices | ❌ | ✅ |
| Add, deactivate, or change staff roles | ❌ | ✅ |
| View the Activity log, weekly report, price suggestions | ❌ | ✅ |

---

## 🤖 About the Assistant

- Gemini never connects to your database. It only chooses which **read-only tool** to call (for example, "bookings arriving tomorrow").
- The server runs the query on MongoDB and sends the result back. The answer is written from that result.
- The table under each answer comes straight from the query, so staff can check the text against the rows.
- The model sees guest codes (G1, G2), never names or emails. The server puts real names back after the answer is written.
- If an answer comes back without any data lookup, the screen shows a yellow warning.
- Limits: 20 questions per minute and 150 per day per user (kept in memory, so they reset on restart).
- Numbers in the weekly report and price suggestions are calculated by the server. The model only writes the text. Price suggestions never move more than 15% and are never applied automatically.

> The free Gemini tier may use requests to improve Google's products. For real guest data, use a paid tier.

---

## 🧱 Project Structure

```
app/            Pages and API route handlers (App Router)
features/       Screens grouped by area (bookings, cabins, guests, assistant, ...)
ui/             Shared components (tables, forms, modals, menus, skeletons)
hooks/          Shared React hooks
services/       Browser-side API calls
lib/            Server helpers (auth, validation, booking rules, insights, AI)
models/         Mongoose models
styles/         Design tokens and breakpoints
scripts/        seed.js and create-admin.js
```

```
Browser ─► pages (React Query)
             │ fetch('/api/...')
             ▼
        Route handlers ─► session check ─► Zod ─► Mongoose ─► MongoDB Atlas
             └──────────► Cloudinary (photos)
```

---

## 🚀 Deployment

1. Push to GitHub and import the repo into your host (for example Vercel).
2. Add every environment variable above. Set `AUTH_URL` to the production domain and use a **new** `AUTH_SECRET`.
3. In MongoDB Atlas, enable backups and limit **Network Access** to what you need.
4. Run `npm run create-admin` once against the production `MONGODB_URI`, then add staff from the **Users** page.
5. Do **not** run the seed in production.

---

## 📝 Notes

- Booking dates are stored as midnight UTC of the calendar day. "Today" in the UI uses the browser's local calendar day.
- Login attempts are rate limited in memory per server instance. Use Redis or similar if you run several instances.
- This is an internal tool. Pages are marked `noindex`, and security headers are enabled.

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm run seed -- --yes` | Load sample data (development only) |
| `npm run create-admin -- "Name" email` | Create an admin account |
