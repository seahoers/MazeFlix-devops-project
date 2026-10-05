_This repo contains the final deliverable of our [Project Proposal](https://github.com/KTH/devops-course/pull/3002) where a DevOps pipline is developed "on top" of an existing project._

<br>

**This README consists of two parts:**
- Part 1: ["DevOps Project"](#devops-project)<br>Instructions and documentation regarding what has been built "on top" of the initial project.<br><br>
- Part 2: ["MazeFlix - TV Show Dashboard"](#mazeflix---tv-show-dashboard)<br>Kept as a reference, the README from the initial project's repository.

<br>
<br>
<br>

# DevOps Project

## 🚀 Getting Started

The repo is a Bun workspace with two packages: [`frontend/`](frontend) (the initial project's Vue app) and [`backend/`](backend) (the Express + Postgres API it talks to
for sign up / sign in).

---

### Instructions: For running the DevOps pipeline


#### **Prerequisites**
- [Docker](https://docker.com) installed and running.

<br>

#### **Setup**
- **Step 1:** Fork this repository
- **Step 2:** Add Repository secrets<br>_(Settings > Secrets and variables > Actions)_
  - `DOCKERHUB_USERNAME`
  - `DOCKERHUB_TOKEN`
  - `POSTGRES_PASSWORD` (any non-empty, URL-safe string)
- **Step 3:** Set up GitHub self-hosted runner<br>_(Settings > Actions > Runners > "New self-hosted runner")_
  - Follow the provided steps to install and set up.
  - To run it, do .

<br>

#### **Test it out!**
Make sure that:
- **GitHub self-hosted runner is running**<br>(`./run.sh` inside runner's root folder).
- **Docker daemon is running**

<br>

To intitiate the pipeline, you can push a change to the repo. However, the easiest way is to just run the workflow manually from: **Actions** (main menu) > `CI` > 'Run workflow'. This will run the pipeline from start to finish and deploy it to the machine where the runner is set up.

<br>

---

<br>

### Instructions: For local development

**Prerequisites:**
- [Docker](https://docker.com) installed and running.
- [Bun](https://bun.sh) 1.4+
- [Node.js](https://nodejs.org/) 20.19+ or 22.12+
- A Postgres database for the backend (Terraform provisions one for the deployed stack. For local development, run any Postgres 16 instance and point `backend/.env` at it — see `backend/.env.example`)

<br>

**Install dependencies (from the repo root):**
```bash
bun install
```

**Run the frontend:**
```bash
cd frontend && bun run dev
```

**Run the backend** (requires `DATABASE_URL` — copy `backend/.env.example` to
`backend/.env` and adjust as needed):
```bash
cd backend && bun run dev
```

**Run tests:**
```bash
cd frontend && bun run test   # Vue components, stores, repositories
cd backend && bun run test    # routes, against a real Postgres
```
The backend's route tests truncate tables between tests, so they refuse to
run unless `DATABASE_URL` points at a database whose name ends in `_test` —
see `backend/.env.example` for how to set one up.

**Database migrations** (backend): schema changes are written as Drizzle
migrations, generated from `backend/src/db/schema.ts`:
```bash
cd backend && bun run db:generate   # writes SQL under backend/drizzle/
```
Migrations are applied automatically when the backend starts (see
`backend/src/index.ts`) — Terraform provisions the Postgres container itself,
but does not run migrations.

## 🛠️ Technical Stack

**Backend**
- **Express** (TypeScript, running on Bun)
- **Drizzle ORM** (Postgres, SQL-first migrations)
- **Bun's built-in `Bun.password`** (argon2id password hashing)
- **`bun test`** (unit + route tests against a real Postgres)


---

### Server-Side Sessions for Auth

**Context:**
Sign up / sign in needed to store credentials ourselves (not delegate to an
OAuth provider), and the deployed stack already runs two frontend containers
and a Postgres instance behind a shared nginx load balancer.

**Decision:**
The backend hashes passwords with Bun's built-in `Bun.password` (argon2id, no native npm dependency to break the multi-arch Docker build) and issues an opaque, random session token on sign in, stored hashed (SHA-256) in a `sessions` table and set as an `httpOnly` cookie. This was chosen over JWTs specifically for **instant revocation**: signing out or invalidating a compromised session is a single row delete, rather than needing a
server-side blocklist that would cancel out most of a JWT's statelessness benefit anyway. nginx proxies `/api/*` to the backend on the same origin, so the cookie can use `SameSite=Lax` without any CORS configuration.

**Consequences:**
- Every authenticated request costs a session lookup (a DB round trip), which
  a stateless JWT wouldn't need — an acceptable trade for this app's scale.
- The catalog itself stays fully public; auth only gates the account UI.

---

## 📚 API

The bundled `backend/` exposes its own API under `/api`:

| Endpoint                   | Method | Description                               |
| -------------------------- | ------ | ----------------------------------------- |
| `/api/auth/signup`         | POST   | Create an account, sign in                |
| `/api/auth/signin`         | POST   | Sign in with email + password             |
| `/api/auth/signout`        | POST   | Invalidate the current session            |
| `/api/auth/me`             | GET    | Current signed-in user (401 if none)      |
| `/api/watchlist`           | GET    | List the signed-in user's show IDs        |
| `/api/watchlist`           | POST   | Add a show with `{ "showId": 42 }`        |
| `/api/watchlist/:showId`   | DELETE | Remove a show by its ID                   |
| `/api/health`              | GET    | Liveness check                            |

All watchlist endpoints require a signed-in session (otherwise they return 401).
`GET /api/watchlist` returns an array of show IDs in the order they were added.
`POST /api/watchlist` returns 201 with the added `showId`; adding the same show
again does not create a duplicate. `DELETE /api/watchlist/:showId` returns 204,
including when the show was not in the watchlist. Invalid show IDs return 400.


<br>
<br>
<br>

# MazeFlix - TV Show Dashboard

_README from [original repository](https://github.com/annerland/MazeFlix/tree/main)._

<br>

A Vue 3 application for browsing TV shows, genre-based carousels, debounced search, and detailed show information. Built with TypeScript, Pinia, Tailwind CSS, and Vitest.

**Link:**
https://chipper-baklava-ea44a4.netlify.app/

**Example:**

https://github.com/user-attachments/assets/d2a3b78b-9d59-4541-9367-18a4059580f9

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- pnpm (recommended) or npm

**Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```
**Start the development server:**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```
**Run tests:**
   ```bash
   pnpm test
   # or
   npm run test
   ```

  

## ✨ Features

- **Dashboard:** Horizontal, animated carousels organized by genre
- **Genre-Based Organization:** Automatic categorization and sorting by rating
- **Debounced Search:** Real-time, efficient search with a Netflix-style expanding bar
- **Show Details:** Responsive detail view with summary, metadata, and genre links
- **Responsive Design:** Optimized for desktop and mobile
- **Error Handling:** User-friendly error and empty states
- **Modern UI:** Fixed, animated header; animated cards; smooth transitions

---

## 🛠️ Technical Stack

- **Vue 3** (Composition API)
- **TypeScript** (strict mode)
- **Pinia** (state management)
- **Vue Router** (routing)
- **Tailwind CSS** (utility-first styling)
- **Axios** (HTTP client)
- **Vitest** (unit testing)
- **@vue/test-utils** (component testing)

---

## 🧩 Architecture

### Repository Pattern and Client-Side Caching

**Context:**  
The TVMaze API has a few limitations I needed to work around: there's no server-side caching or filtering by genre, and the data comes paginated. Some shows are also missing important pieces like images or metadata. On top of that, repeated API calls can be slow and might trigger rate limits. Since the goal is to deliver a smooth and responsive user experience, I would like to minimize unnecessary network calls wherever possible.

**Decision:**  
To solve this, I wrapped all API interactions in a `TvmazeRepository`. This layer takes care of normalizing data, handling errors consistently, and giving us a clean, predictable interface to work with. Once the shows are fetched, they’re cached in a centralized Pinia store `allShows`, so we’re not hitting the API more than we need to. Filtering (like by genre) is done on the client side, directly on this cached data. Additional show details and banners are also cached after their initial request.

**Consequences:**  
- We avoid redundant API calls and reduce the risk of running into rate limits.
- The app feels faster and more responsive since most data is served from memory.
- Error handling and data shaping happen in one place, which makes the codebase easier to maintain and test.
- This setup also makes easier to mock data for unit tests.
- Enables easy mocking for unit tests.
- Initial load may require multiple paginated requests.
- Client memory usage increases with the number of cached shows.
- Cache invalidation is not automatic if the API data changes.

---

### Centralized State Management with Pinia

**Context:**  
To keep the UI reactive and consistent across views, we need a shared state for things like show data, search terms, and error messages. Multiple components depend on the same data and need to update automatically when something changes.

**Decision:**  
I chose Pinia for centralized state management. All show data, search state, and errors live in a single store. I’ve also exposed computed properties for things like genre lists, filtered results, and search mode to keep components away from unecessary logic.

**Consequences:**  
- All components stay in sync automatically, which simplifies the app architecture.
- The data flow becomes easier to follow and debug.
- It’s simple to extend or refactor the logic in one place if needed.
- It's easier to learn for contributors unfamiliar with Pinia.

---

## 📚 API

This project uses the [TVMaze API](https://api.tvmaze.com) for all show data. No auth required.
