# Daily Tasks Google Calendar App — The Full Story

## What This Project Actually Does

Imagine you have 6 things you want to get done every day. Maybe it's exercise, study, call someone, read, meditate, and cook dinner. Now imagine your Google Calendar automatically turns green when you nail all 6, yellow when you hit 4, red when you barely started, and gray when you didn't even try.

That's this app. It's a full-stack web application that gives you exactly 6 task slots per day, syncs everything to your Google Calendar using a clever storage trick, and paints your calendar in a color gradient from gray (0/6) to green (6/6). Open Google Calendar on your phone and you can *see* your productivity at a glance — no extra app needed.

---

## The Technical Architecture (The Big Picture)

This is a **two-server setup**:

```
Browser (React on :3001)  <-->  Backend (Express on :5002)  <-->  Google Calendar API
```

The frontend is a React app that shows you a calendar and lets you click dates to manage tasks. The backend is an Express server that handles authentication and talks to Google's API. There's **no database** — and that's the interesting part.

### Where Does the Data Live?

Google Calendar events have a hidden feature called **Extended Properties** — basically key-value pairs you can attach to any event that are invisible to the user but accessible via the API. We store all task data there.

Think of it like writing notes in invisible ink on the back of a calendar event. Google stores it, syncs it, and backs it up — we just piggyback on their infrastructure. This means:

- Zero database setup
- Zero database costs
- Data lives wherever your Google account lives
- It survives even if our app disappears

The trade-off? We're limited by Google's API rate limits and the size constraints of Extended Properties. For 6 tasks per day, this is more than enough.

---

## The Codebase Structure

### Backend (`backend/`)

```
backend/src/
├── server.ts              ← The front door. Express starts here.
├── config/
│   ├── googleAuth.ts      ← Creates the OAuth2 client
│   └── session.ts         ← Cookie/session configuration
├── controllers/           ← Handle HTTP requests
│   ├── authController.ts  ← Login, logout, token refresh
│   ├── tasksController.ts ← CRUD for daily tasks
│   └── calendarController.ts ← Month overview data
├── middleware/
│   ├── authMiddleware.ts  ← "Are you logged in?" check
│   ├── errorHandler.ts    ← Catch-all for unhandled errors
│   └── validateRequest.ts ← Input sanitization
├── routes/                ← URL → Controller mapping
├── services/
│   ├── googleCalendarService.ts ← The Google API wrapper
│   └── taskService.ts     ← Business logic (validation, creation)
├── types/                 ← TypeScript interfaces
└── utils/
    ├── colorMapper.ts     ← Completion count → Google color ID
    ├── errorHelpers.ts    ← Custom error class
    └── validators.ts      ← express-validator rules
```

**How it flows:** A request hits a route → the route calls a controller → the controller uses a service → the service talks to Google's API.

This is a classic **layered architecture**. Each layer only knows about the layer below it. The controller doesn't know how Google Calendar works — it just asks the service. The service doesn't know about HTTP — it just takes data and returns data. This makes each piece testable and replaceable independently.

### Frontend (`frontend/`)

```
frontend/src/
├── main.tsx / App.tsx     ← Entry point and routing
├── context/
│   └── AuthContext.tsx    ← Global auth state
├── components/
│   ├── Auth/              ← Login/Logout/ProtectedRoute
│   ├── Calendar/          ← CalendarView, ColorLegend
│   ├── Tasks/             ← TaskPanel, TaskList, TaskItem
│   ├── Layout/            ← Header, LoadingSpinner
│   └── Common/            ← ErrorMessage, Toast
├── hooks/                 ← useTasks, useCalendar
├── services/
│   └── api.ts             ← Axios instance with interceptors
├── types/                 ← Shared TypeScript interfaces
├── utils/                 ← Color maps, date formatters
├── pages/                 ← LoginPage, CalendarPage, NotFoundPage
└── styles/                ← Tailwind base + calendar overrides
```

**The component hierarchy:**
```
App
├── LoginPage (if not authenticated)
└── CalendarPage (if authenticated)
    ├── Header (user info + logout)
    ├── CalendarView (React Big Calendar)
    │   └── TaskPanel (modal, opens on date click)
    │       └── TaskList
    │           └── TaskItem × 6
    └── ColorLegend (sidebar)
```

---

## How the Parts Connect

### Authentication Flow

This is where most of the complexity lives. Here's what happens when you click "Sign in with Google":

1. **Frontend** opens a Google OAuth popup using `@react-oauth/google`
2. **Google** shows the consent screen ("This app wants to access your calendar")
3. **Google** sends back an authorization **code** (not a token — this is important)
4. **Frontend** sends that code to `POST /auth/google` on our backend
5. **Backend** exchanges the code for an **access token** (short-lived, ~1 hour) and a **refresh token** (long-lived)
6. **Backend** stores the refresh token in an **HttpOnly session cookie** (the browser can't read it via JavaScript — this is a security measure)
7. **Backend** sends the access token back to the frontend
8. **Frontend** stores the access token in **React state** (memory only — gone on page refresh)

Why this split? The refresh token is the keys to the kingdom — anyone with it can access your Google Calendar indefinitely. By keeping it in an HttpOnly cookie, even if someone injects malicious JavaScript into the page (XSS attack), they can't steal it. The access token expires in an hour, limiting the damage window.

### The Token Refresh Dance

When the access token expires, the Axios interceptor catches the 401 response, calls `POST /auth/refresh`, gets a new access token from the backend (which uses the stored refresh token), and **retries the original request**. The user never notices.

This is implemented in `api.ts` with Axios interceptors — think of them as middleware for HTTP requests. Every request gets the token attached automatically, and every 401 response triggers a refresh attempt automatically.

### Task Data Flow

When you click a date and save tasks:

1. **TaskPanel** collects the 6 tasks (titles + completion states)
2. Calls `PUT /tasks/2026-02-03` with the task array
3. **Backend** validates (exactly 6 tasks, titles ≤ 100 chars)
4. **googleCalendarService** searches for an existing event on that date with `privateExtendedProperty: 'appId=dailyTasksTracker'`
5. If found → `events.patch()` (update). If not → `events.insert()` (create)
6. The event's **colorId** is set based on completion count (0=gray, 6=green)
7. Task data is JSON-stringified into the event's Extended Properties

The "search before create" pattern prevents duplicate events — a classic **upsert** operation.

---

## Technologies and Why We Chose Them

| Technology | Why |
|---|---|
| **TypeScript** (both sides) | Catches bugs before they run. When your task interface changes, TypeScript tells you every place that breaks. |
| **React Big Calendar** | Battle-tested calendar component. Building a calendar from scratch is a month-long project full of edge cases (timezones, DST, leap years). |
| **Express + express-session** | Simple, well-understood server framework. Sessions with HttpOnly cookies are more secure than JWT for this use case (we can revoke sessions server-side). |
| **Tailwind CSS** | Utility-first CSS means you style components without leaving the JSX file. No more switching between `.tsx` and `.css` files. |
| **Vite** | Instant dev server startup. Webpack takes seconds; Vite takes milliseconds. It uses native ES modules during dev. |
| **Extended Properties** | Zero-cost "database." Google handles storage, backup, and sync. Perfect for an MVP. |
| **Axios over fetch** | Interceptors for automatic token refresh. Request/response transformation. Better error handling. |

### Why Sessions Over JWT?

JWTs are popular, but they have a fundamental flaw for this use case: you can't revoke them server-side. If a user logs out, you can delete the JWT from the browser, but if someone copied it, it's still valid until expiration. With sessions, calling `req.session.destroy()` immediately invalidates access — the server is the source of truth.

---

## Lessons and Insights

### 1. The "Search Before Create" Pattern

Never assume data doesn't exist. The `createOrUpdateTaskEvent` function always searches for an existing event before creating a new one. Without this, clicking "Save" twice would create two calendar events for the same date. This pattern shows up everywhere in production code — idempotent operations are your friend.

### 2. Layered Token Security

Good engineers think about security in layers:
- Access token in memory (not localStorage — XSS can read localStorage)
- Refresh token in HttpOnly cookie (JavaScript can't touch it)
- Session secret on server only (never in frontend code)
- Client secret on server only (the frontend never sees it)

Each layer limits the blast radius if another layer is compromised.

### 3. The Interceptor Pattern

The Axios interceptor in `api.ts` is a beautiful example of the **decorator pattern** in practice. Every HTTP request automatically gets authentication headers, and every failed request automatically attempts recovery. The components making API calls don't know or care about token management — they just call `api.get('/tasks/2026-02-03')` and it works.

This is how good engineers think: **separate the concerns**. The component knows about tasks. The interceptor knows about tokens. Neither needs to know about the other.

### 4. Why Exactly 6 Tasks?

This is a **product constraint that simplifies engineering**. By fixing the number at 6, we avoid:
- Dynamic array resizing in the UI
- Pagination
- Variable color mapping
- "Add task" / "Delete task" button state management
- Unbounded storage in Extended Properties

Constraints aren't limitations — they're design decisions that keep complexity in check. The best engineers know that saying "no" to features is just as important as building them.

### 5. The Color Mapping Is a Lookup Table, Not a Formula

```typescript
const COLOR_MAP: Record<number, string> = {
  0: '8',   // Gray
  1: '11',  // Red
  2: '4',   // Pale Red
  3: '6',   // Orange
  4: '5',   // Yellow
  5: '2',   // Pale Green
  6: '10',  // Green
};
```

Google's color IDs don't follow a logical sequence (8, 11, 4, 6, 5, 2, 10). A junior developer might try to derive a formula. A senior developer uses a lookup table. It's explicit, debuggable, and won't break if Google changes their internal numbering.

### 6. Potential Pitfalls

- **Forgetting `withCredentials: true`** on the Axios instance means cookies don't get sent cross-origin, and your session silently fails. This is the #1 cause of "auth works in Postman but not in the browser."
- **Extended Properties have size limits.** If task titles get very long, the JSON string could exceed Google's limit. The 100-character title cap prevents this.
- **Google OAuth consent screen in "Testing" mode** only allows pre-registered test users. You must add your email in the Google Cloud Console.
- **Rate limits.** Google Calendar API allows ~500 requests per 100 seconds. The month-view endpoint makes one API call per month, not one per day, to stay well within limits.

### 7. How This Project Demonstrates Professional Patterns

- **Separation of concerns:** Routes → Controllers → Services → External APIs
- **Type safety end-to-end:** The same `Task` interface exists in both frontend and backend
- **Graceful degradation:** Loading spinners during API calls, error messages on failure, automatic token refresh on expiry
- **Security by default:** Helmet headers, CORS restrictions, HttpOnly cookies, input validation
- **Convention over configuration:** Predictable file naming, consistent code structure, standard REST endpoints

---

## What You Could Build Next

- **Streaks:** Count consecutive days with 6/6 completion
- **Weekly/monthly stats:** Aggregate completion rates with charts
- **Task templates:** Pre-fill common daily tasks
- **Redis session store:** Replace the in-memory MemoryStore for production (the current one doesn't scale and leaks memory)
- **Deploy:** Frontend on Netlify (free), backend on Railway or Render

---

The beauty of this project is that it turns Google Calendar into a visual accountability system. You don't need to open our app to see your progress — just glance at your calendar and the colors tell the story.
