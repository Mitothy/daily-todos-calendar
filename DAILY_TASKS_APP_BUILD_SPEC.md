# 🎯 DAILY TASKS GOOGLE CALENDAR APP - COMPLETE BUILD SPECIFICATION

Build a full-stack TypeScript web application that creates a daily task tracking system integrated with Google Calendar using Extended Properties. Users can manage exactly 6 tasks per day, with automatic color-coding on Google Calendar based on completion progress (0-6 completed tasks).

---

## 1. TECH STACK - LOCKED IN

### Frontend
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite 5.0+
- **Styling:** Tailwind CSS 3.4+
- **Calendar UI:** React Big Calendar (react-big-calendar)
- **HTTP Client:** Axios 1.6+
- **State Management:** React Context API (built-in)
- **Date Handling:** date-fns 3.0+
- **Routing:** React Router v6
- **Google Auth:** @react-oauth/google

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.18+
- **Language:** TypeScript
- **Google API Client:** googleapis
- **Environment Variables:** dotenv
- **CORS:** cors middleware
- **Session Management:** express-session with MemoryStore (MVP), HttpOnly cookies
- **Security:** helmet (security headers)
- **Request Validation:** express-validator

### Development Ports
- **Frontend:** http://localhost:3001
- **Backend:** http://localhost:5002

### Deployment Target
- **Phase 1:** Local development only
- **Phase 2:** Frontend on Netlify, Backend on Railway/Render (future)

---

## 2. CORE FEATURES - DETAILED REQUIREMENTS

### 2.1 Authentication System
**Priority: CRITICAL - Build This First**

**OAuth 2.0 Flow with Session Management:**

1. **Initial Authentication:**
   ```typescript
   // User flow:
   // 1. Click "Sign in with Google" button
   // 2. Redirect to Google OAuth consent screen
   // 3. User grants calendar access
   // 4. Google redirects to: http://localhost:5002/auth/google/callback?code=...
   // 5. Backend exchanges code for tokens
   // 6. Backend stores refresh token in session
   // 7. Backend sets HttpOnly session cookie
   // 8. Backend sends access token to frontend
   // 9. Frontend stores access token in memory (React state)
   ```

2. **Token Management:**
   - **Access Token:** Expires in 1 hour, stored in React Context (memory)
   - **Refresh Token:** Long-lived, stored in express-session (backend only)
   - **Session Cookie:** HttpOnly, Secure (in production), SameSite=Strict
   - Implement automatic token refresh before expiry
   - Handle 401 errors by refreshing token, then retry original request

3. **Session Persistence:**
   ```typescript
   // express-session configuration:
   {
     secret: process.env.SESSION_SECRET,
     resave: false,
     saveUninitialized: false,
     cookie: {
       httpOnly: true,
       secure: false, // true in production
       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
       sameSite: 'lax'
     }
   }
   ```

4. **Protected Routes:**
   - Frontend: Redirect to login if no access token in Context
   - Backend: Middleware checks for valid session
   - Show loading spinner during auth check
   - Persist auth state across page refreshes using session cookie

**API Endpoints:**
```typescript
POST /auth/google
     Body: { code: string }
     Returns: { accessToken: string, user: { email: string, name: string, picture: string } }
     Side effect: Sets session cookie with refresh token

POST /auth/refresh
     Headers: { Cookie: session cookie }
     Returns: { accessToken: string }

POST /auth/logout
     Headers: { Cookie: session cookie }
     Returns: { message: "Logged out" }
     Side effect: Destroys session

GET /auth/status
    Headers: { Cookie: session cookie }
    Returns: { authenticated: boolean, user?: { email, name, picture } }
```

**Security Requirements:**
- NEVER expose refresh token to frontend
- NEVER store Client Secret in frontend code
- Validate all inputs with express-validator
- Use helmet middleware for security headers
- Enable CORS only for http://localhost:3001

### 2.2 Daily Task Management
**Priority: HIGH**

**Strict Constraints:**
- **Exactly 6 tasks per day** (enforced on frontend AND backend)
- Cannot add more than 6 tasks
- Cannot delete tasks (set title to empty string instead)
- Each task: `{ id: string (UUID), title: string (max 100 chars), completed: boolean, completedAt: string | null }`

**User Interactions:**

1. **View Calendar:**
   ```
   - User sees monthly calendar (React Big Calendar)
   - Each date cell shows:
     * Day number
     * Background color matching Google Calendar
     * Small badge: "X/6" showing completion count
   - Clicking a date opens Task Panel
   ```

2. **Task Panel (Modal/Drawer):**
   ```typescript
   // Opens when user clicks any date
   // Shows:
   interface TaskPanelProps {
     selectedDate: Date;
     tasks: Task[]; // Array of 6 tasks
     onSave: (tasks: Task[]) => Promise<void>;
     onClose: () => void;
   }

   // Layout:
   // ┌─────────────────────────────────┐
   // │ Tuesday, February 3, 2026       │
   // │ Completed: 3/6                  │
   // │ Color: Orange                   │
   // ├─────────────────────────────────┤
   // │ ☐ Task 1 ________________       │
   // │ ☑ Task 2 ________________       │
   // │ ☐ Task 3 ________________       │
   // │ ☑ Task 4 ________________       │
   // │ ☑ Task 5 ________________       │
   // │ ☐ Task 6 ________________       │
   // ├─────────────────────────────────┤
   // │          [Cancel] [Save]         │
   // └─────────────────────────────────┘
   ```

3. **Task Operations:**
   ```typescript
   // Create tasks (first time for a date):
   POST /tasks/:date
        Body: { tasks: Task[] } // Must have exactly 6 tasks
        Creates Google Calendar event with Extended Properties
        Returns: { eventId, tasks, completionRate, colorId }

   // Load tasks for a date:
   GET /tasks/:date
       Searches Google Calendar for event with privateExtendedProperty: "appId=dailyTasksTracker"
       Returns: { date, tasks, completionRate, colorId } | null

   // Toggle task completion:
   PATCH /tasks/:date/:taskId/toggle
         Updates specific task in Extended Properties
         Recalculates completion rate
         Updates Google Calendar colorId
         Returns: { task, completionRate, colorId }

   // Update task title:
   PATCH /tasks/:date/:taskId/title
         Body: { title: string }
         Updates title in Extended Properties
         Returns: { task }

   // Bulk update (save all 6 tasks):
   PUT /tasks/:date
       Body: { tasks: Task[] }
       Replaces entire task array
       Returns: { tasks, completionRate, colorId }
   ```

**Data Structure in Google Calendar Extended Properties:**
```json
{
  "extendedProperties": {
    "private": {
      "appId": "dailyTasksTracker",
      "version": "1.0",
      "tasksData": "{\"tasks\":[{\"id\":\"550e8400-e29b-41d4-a716-446655440000\",\"title\":\"Morning workout\",\"completed\":true,\"completedAt\":\"2026-02-03T06:30:00.000Z\"},{\"id\":\"550e8400-e29b-41d4-a716-446655440001\",\"title\":\"Study TypeScript\",\"completed\":false,\"completedAt\":null},{\"id\":\"550e8400-e29b-41d4-a716-446655440002\",\"title\":\"Call mom\",\"completed\":true,\"completedAt\":\"2026-02-03T14:20:00.000Z\"},{\"id\":\"550e8400-e29b-41d4-a716-446655440003\",\"title\":\"Grocery shopping\",\"completed\":false,\"completedAt\":null},{\"id\":\"550e8400-e29b-41d4-a716-446655440004\",\"title\":\"Read 30 pages\",\"completed\":true,\"completedAt\":\"2026-02-03T21:10:00.000Z\"},{\"id\":\"550e8400-e29b-41d4-a716-446655440005\",\"title\":\"Meditate 10 min\",\"completed\":false,\"completedAt\":null}],\"completionRate\":50,\"lastUpdated\":\"2026-02-03T21:15:00.000Z\"}"
    }
  }
}
```

### 2.3 Google Calendar Integration
**Priority: HIGH**

**Event Creation & Management:**

1. **Event Properties:**
   ```typescript
   interface CalendarEvent {
     summary: string; // "Daily Tasks: 3/6"
     start: { date: string }; // "2026-02-03"
     end: { date: string }; // "2026-02-03"
     colorId: string; // "6" for orange
     extendedProperties: {
       private: {
         appId: "dailyTasksTracker";
         version: "1.0";
         tasksData: string; // JSON stringified
       }
     }
   }
   ```

2. **Event Lifecycle Logic:**
   ```typescript
   async function upsertDailyTaskEvent(date: string, tasks: Task[]) {
     const calendar = google.calendar({ version: 'v3', auth });
     
     // Step 1: Check if event already exists
     const existingEvents = await calendar.events.list({
       calendarId: 'primary',
       timeMin: new Date(`${date}T00:00:00Z`).toISOString(),
       timeMax: new Date(`${date}T23:59:59Z`).toISOString(),
       privateExtendedProperty: 'appId=dailyTasksTracker',
       maxResults: 1
     });
     
     const completedCount = tasks.filter(t => t.completed).length;
     const colorId = getColorId(completedCount);
     
     const eventData = {
       summary: `Daily Tasks: ${completedCount}/6`,
       colorId,
       extendedProperties: {
         private: {
           appId: 'dailyTasksTracker',
           version: '1.0',
           tasksData: JSON.stringify({
             tasks,
             completionRate: (completedCount / 6) * 100,
             lastUpdated: new Date().toISOString()
           })
         }
       }
     };
     
     if (existingEvents.data.items && existingEvents.data.items.length > 0) {
       // Update existing event
       const eventId = existingEvents.data.items[0].id;
       await calendar.events.patch({
         calendarId: 'primary',
         eventId,
         requestBody: eventData
       });
     } else {
       // Create new event
       await calendar.events.insert({
         calendarId: 'primary',
         requestBody: {
           ...eventData,
           start: { date },
           end: { date }
         }
       });
     }
   }
   ```

3. **Critical Rules:**
   - ONE event per date maximum
   - ALWAYS search before creating to prevent duplicates
   - Use `events.patch` for updates (more efficient than `update`)
   - Handle API rate limits with exponential backoff (max 3 retries)
   - Never delete events (users might have added them to calendar manually)

### 2.4 Color Coding System
**Priority: HIGH - EXACT IMPLEMENTATION REQUIRED**

**Google Calendar Color ID Mapping:**

```typescript
// EXACT color mapping - DO NOT CHANGE
const COLOR_MAP: Record<number, string> = {
  0: '8',   // Gray     - No tasks completed
  1: '11',  // Red      - 1 task completed
  2: '4',   // Pale Red - 2 tasks completed
  3: '6',   // Orange   - 3 tasks completed
  4: '5',   // Yellow   - 4 tasks completed
  5: '2',   // Pale Green - 5 tasks completed
  6: '10'   // Green    - All tasks completed
};

function getColorId(completedCount: number): string {
  if (completedCount < 0 || completedCount > 6) {
    throw new Error('Invalid completion count. Must be 0-6.');
  }
  return COLOR_MAP[completedCount];
}
```

**Frontend Color Matching (Tailwind CSS):**

```typescript
// Hex values matching Google Calendar colors
const TAILWIND_COLORS: Record<number, string> = {
  0: 'bg-gray-600',      // #5A5A5A
  1: 'bg-red-600',       // #DC2127
  2: 'bg-red-400',       // #FF887C
  3: 'bg-orange-400',    // #FFB878
  4: 'bg-yellow-400',    // #FBD75B
  5: 'bg-green-300',     // #7AE7BF
  6: 'bg-green-500'      // #51B749
};

// Or use exact hex codes:
const HEX_COLORS: Record<number, string> = {
  0: '#5A5A5A',
  1: '#DC2127',
  2: '#FF887C',
  3: '#FFB878',
  4: '#FBD75B',
  5: '#7AE7BF',
  6: '#51B749'
};
```

**Color Legend Component (must display in UI):**
```tsx
<div className="color-legend">
  <h3>Task Completion Colors</h3>
  <div className="flex flex-col gap-2">
    <ColorLegendItem count={6} color="green" label="All done! 🎉" />
    <ColorLegendItem count={5} color="pale-green" label="Almost there!" />
    <ColorLegendItem count={4} color="yellow" label="Good progress" />
    <ColorLegendItem count={3} color="orange" label="Halfway there" />
    <ColorLegendItem count={2} color="pale-red" label="Getting started" />
    <ColorLegendItem count={1} color="red" label="Just beginning" />
    <ColorLegendItem count={0} color="gray" label="Not started" />
  </div>
</div>
```

### 2.5 Calendar UI with React Big Calendar
**Priority: MEDIUM**

**React Big Calendar Setup:**

```typescript
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  title: string; // "3/6"
  start: Date;
  end: Date;
  allDay: boolean;
  resource: {
    date: string;
    completedCount: number;
    colorId: string;
  };
}

<Calendar
  localizer={localizer}
  events={calendarEvents}
  startAccessor="start"
  endAccessor="end"
  style={{ height: '80vh' }}
  views={['month']}
  defaultView="month"
  onSelectSlot={(slotInfo) => handleDateClick(slotInfo.start)}
  selectable
  eventPropGetter={(event) => ({
    style: {
      backgroundColor: HEX_COLORS[event.resource.completedCount],
      borderColor: HEX_COLORS[event.resource.completedCount],
      color: event.resource.completedCount <= 2 ? 'white' : 'black'
    }
  })}
/>
```

**Custom Styling Requirements:**
- Today's date: Bold border + highlight
- Dates with tasks: Show colored background matching Google Calendar
- Date cells: Display "X/6" badge in top-right corner
- Hover effect: Slight scale animation on date cells
- Responsive: Stack vertically on mobile, side-by-side on desktop

**Task Panel/Modal:**
```tsx
interface TaskPanelProps {
  date: Date;
  isOpen: boolean;
  onClose: () => void;
}

// Features:
// - Overlay backdrop (click to close)
// - Keyboard shortcuts: Esc to close, Enter to save
// - Loading state while saving
// - Error handling with toast notifications
// - Optimistic updates (update UI immediately, rollback on error)
```

---

## 3. DEPENDENCIES - EXACT VERSIONS

### Backend (backend/package.json)
```json
{
  "name": "daily-tasks-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "googleapis": "^128.0.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "express-session": "^1.17.3",
    "express-validator": "^7.0.1",
    "helmet": "^7.1.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/express-session": "^1.17.10",
    "@types/node": "^20.10.5",
    "@types/cors": "^2.8.17",
    "@types/uuid": "^9.0.7",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

### Frontend (frontend/package.json)
```json
{
  "name": "daily-tasks-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 3001",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "react-big-calendar": "^1.8.5",
    "moment": "^2.30.1",
    "axios": "^1.6.2",
    "date-fns": "^3.0.6",
    "@react-oauth/google": "^0.12.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "@types/react-big-calendar": "^1.8.9",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.8"
  }
}
```

---

## 4. PROJECT STRUCTURE - EXACT FILE ORGANIZATION

```
daily-tasks-app/
│
├── backend/
│   ├── src/
│   │   ├── server.ts                    # Express app entry point
│   │   │
│   │   ├── config/
│   │   │   ├── googleAuth.ts            # OAuth2Client setup
│   │   │   └── session.ts               # express-session config
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.ts        # OAuth flow handlers
│   │   │   ├── tasksController.ts       # Task CRUD operations
│   │   │   └── calendarController.ts    # Google Calendar API calls
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts        # Session validation
│   │   │   ├── errorHandler.ts          # Global error handling
│   │   │   └── validateRequest.ts       # Input validation
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.ts           # /auth/* endpoints
│   │   │   ├── tasks.routes.ts          # /tasks/* endpoints
│   │   │   └── calendar.routes.ts       # /calendar/* endpoints
│   │   │
│   │   ├── services/
│   │   │   ├── googleCalendarService.ts # Calendar API wrapper
│   │   │   └── taskService.ts           # Business logic for tasks
│   │   │
│   │   ├── types/
│   │   │   ├── express.d.ts             # Express session types
│   │   │   ├── task.types.ts            # Task interface
│   │   │   └── calendar.types.ts        # Calendar event types
│   │   │
│   │   └── utils/
│   │       ├── colorMapper.ts           # Completion -> ColorID
│   │       ├── validators.ts            # Validation schemas
│   │       └── errorHelpers.ts          # Error formatting
│   │
│   ├── .env                             # NEVER COMMIT
│   ├── .env.example                     # Template
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── main.tsx                     # App entry point
│   │   ├── App.tsx                      # Root component with Router
│   │   ├── vite-env.d.ts                # Vite types
│   │   │
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginButton.tsx
│   │   │   │   ├── LogoutButton.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   │
│   │   │   ├── Calendar/
│   │   │   │   ├── CalendarView.tsx     # React Big Calendar wrapper
│   │   │   │   ├── ColorLegend.tsx      # Shows all 7 colors
│   │   │   │   └── MonthSelector.tsx    # Month navigation
│   │   │   │
│   │   │   ├── Tasks/
│   │   │   │   ├── TaskPanel.tsx        # Modal with 6 tasks
│   │   │   │   ├── TaskList.tsx         # List of TaskItem
│   │   │   │   └── TaskItem.tsx         # Checkbox + input
│   │   │   │
│   │   │   ├── Layout/
│   │   │   │   ├── Header.tsx           # App header with logout
│   │   │   │   └── LoadingSpinner.tsx
│   │   │   │
│   │   │   └── Common/
│   │   │       ├── ErrorMessage.tsx
│   │   │       └── Toast.tsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.tsx          # Auth state + token management
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts               # Auth operations
│   │   │   ├── useTasks.ts              # Task CRUD operations
│   │   │   ├── useCalendar.ts           # Load month data
│   │   │   └── useLocalStorage.ts       # Persist UI state
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts                   # Axios instance
│   │   │   └── googleAuth.ts            # OAuth popup handling
│   │   │
│   │   ├── types/
│   │   │   ├── task.types.ts            # Task interface
│   │   │   ├── auth.types.ts            # User, AuthState
│   │   │   └── calendar.types.ts        # Calendar events
│   │   │
│   │   ├── utils/
│   │   │   ├── colorMap.ts              # Same as backend
│   │   │   ├── dateHelpers.ts           # Format dates
│   │   │   └── validators.ts            # Frontend validation
│   │   │
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── CalendarPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   │
│   │   └── styles/
│   │       ├── index.css                # Tailwind imports
│   │       └── calendar.css             # React Big Calendar overrides
│   │
│   ├── .env                             # NEVER COMMIT
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── README.md
│
├── .gitignore                           # Root gitignore
└── README.md                            # Main project README
```

---

## 5. ENVIRONMENT VARIABLES

### Backend (.env)
```bash
# Server Configuration
PORT=5002
NODE_ENV=development

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost:5002/auth/google/callback

# Session Configuration
SESSION_SECRET=generate_a_random_32_char_string_here

# CORS Configuration
FRONTEND_URL=http://localhost:3001

# Optional: Logging
LOG_LEVEL=debug
```

### Frontend (.env)
```bash
# Backend API Base URL
VITE_API_URL=http://localhost:5002

# Google OAuth Client ID (public, safe to expose)
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

### .env.example files (commit these!)
Create identical files with placeholder values:
```bash
PORT=5002
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
# ... etc
```

---

## 6. API ENDPOINTS - COMPLETE SPECIFICATION

### Authentication Routes (/auth)

```typescript
// Initiate OAuth flow
POST /auth/google
     Body: { code: string }
     Description: Exchange auth code for tokens, create session
     Returns: {
       accessToken: string;
       user: {
         email: string;
         name: string;
         picture: string;
       }
     }
     Sets: HttpOnly session cookie

// Refresh access token
POST /auth/refresh
     Headers: Cookie with session
     Description: Get new access token using stored refresh token
     Returns: { accessToken: string }

// Check auth status
GET /auth/status
    Headers: Cookie with session
    Description: Check if user is authenticated
    Returns: {
      authenticated: boolean;
      user?: { email: string; name: string; picture: string }
    }

// Logout
POST /auth/logout
     Headers: Cookie with session
     Description: Destroy session and revoke tokens
     Returns: { message: "Logged out successfully" }
```

### Tasks Routes (/tasks)

```typescript
// Get tasks for specific date
GET /tasks/:date
    Params: date (YYYY-MM-DD format)
    Headers: Cookie with session
    Description: Retrieve tasks from Google Calendar Extended Properties
    Returns: {
      date: string;
      tasks: Task[];
      completionRate: number;
      colorId: string;
      eventId: string;
    } | null

// Create tasks for a date (first time)
POST /tasks/:date
     Params: date (YYYY-MM-DD)
     Headers: Cookie with session
     Body: {
       tasks: Task[]; // Must be exactly 6 tasks
     }
     Description: Create Google Calendar event with tasks
     Validation: Ensures exactly 6 tasks, titles <= 100 chars
     Returns: {
       eventId: string;
       tasks: Task[];
       completionRate: number;
       colorId: string;
     }

// Toggle task completion
PATCH /tasks/:date/:taskId/toggle
      Params: date (YYYY-MM-DD), taskId (UUID)
      Headers: Cookie with session
      Description: Toggle completed status, update color
      Returns: {
        task: Task;
        completionRate: number;
        colorId: string;
      }

// Update task title
PATCH /tasks/:date/:taskId/title
      Params: date (YYYY-MM-DD), taskId (UUID)
      Headers: Cookie with session
      Body: { title: string } // Max 100 chars
      Description: Update task title only
      Returns: { task: Task }

// Bulk update all tasks for a date
PUT /tasks/:date
    Params: date (YYYY-MM-DD)
    Headers: Cookie with session
    Body: { tasks: Task[] } // Must be exactly 6
    Description: Replace all tasks for date
    Returns: {
      tasks: Task[];
      completionRate: number;
      colorId: string;
    }
```

### Calendar Routes (/calendar)

```typescript
// Get color mapping
GET /calendar/colors
    Description: Return color ID to completion count mapping
    Returns: {
      colorMap: Record<number, string>;
      hexColors: Record<number, string>;
    }

// Get all task data for a month
GET /calendar/month/:year/:month
    Params: year (YYYY), month (1-12)
    Headers: Cookie with session
    Description: Return tasks for all dates in month
    Returns: {
      month: string; // "2026-02"
      dates: Array<{
        date: string;
        completedCount: number;
        colorId: string;
        eventId: string;
      }>;
    }
```

---

## 7. TYPE DEFINITIONS

### Shared Types (both frontend & backend)

```typescript
// task.types.ts
export interface Task {
  id: string; // UUID v4
  title: string; // Max 100 characters
  completed: boolean;
  completedAt: string | null; // ISO 8601 timestamp
}

export interface TasksData {
  tasks: Task[];
  completionRate: number; // 0-100
  lastUpdated: string; // ISO 8601
}

export interface DailyTaskEvent {
  date: string; // YYYY-MM-DD
  tasks: Task[];
  completionRate: number;
  colorId: string;
  eventId: string;
}

// auth.types.ts
export interface User {
  email: string;
  name: string;
  picture: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  loading: boolean;
}

// calendar.types.ts
export interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: {
    date: string;
    completedCount: number;
    colorId: string;
    eventId: string;
  };
}

export interface MonthData {
  month: string;
  dates: Array<{
    date: string;
    completedCount: number;
    colorId: string;
    eventId: string;
  }>;
}
```

### Backend-Specific Types

```typescript
// express.d.ts (extend express-session)
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId: string;
    refreshToken: string;
    user: {
      email: string;
      name: string;
      picture: string;
    };
  }
}

declare global {
  namespace Express {
    interface Request {
      accessToken?: string;
    }
  }
}
```

---

## 8. CRITICAL IMPLEMENTATION DETAILS

### 8.1 Google Calendar Extended Properties

**Storing Tasks:**
```typescript
// services/googleCalendarService.ts
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export async function createOrUpdateTaskEvent(
  auth: OAuth2Client,
  date: string,
  tasks: Task[]
): Promise<string> {
  const calendar = google.calendar({ version: 'v3', auth });
  
  // Validate: exactly 6 tasks
  if (tasks.length !== 6) {
    throw new Error('Must have exactly 6 tasks');
  }
  
  // Calculate completion
  const completedCount = tasks.filter(t => t.completed).length;
  const colorId = getColorId(completedCount);
  
  // Prepare event data
  const tasksData: TasksData = {
    tasks,
    completionRate: (completedCount / 6) * 100,
    lastUpdated: new Date().toISOString()
  };
  
  const eventBody = {
    summary: `Daily Tasks: ${completedCount}/6`,
    colorId,
    extendedProperties: {
      private: {
        appId: 'dailyTasksTracker',
        version: '1.0',
        tasksData: JSON.stringify(tasksData)
      }
    }
  };
  
  // Check for existing event
  const existing = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date(`${date}T00:00:00Z`).toISOString(),
    timeMax: new Date(`${date}T23:59:59Z`).toISOString(),
    privateExtendedProperty: 'appId=dailyTasksTracker',
    maxResults: 1
  });
  
  if (existing.data.items && existing.data.items.length > 0) {
    // Update existing
    const eventId = existing.data.items[0].id!;
    await calendar.events.patch({
      calendarId: 'primary',
      eventId,
      requestBody: eventBody
    });
    return eventId;
  } else {
    // Create new
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        ...eventBody,
        start: { date },
        end: { date }
      }
    });
    return response.data.id!;
  }
}
```

**Retrieving Tasks:**
```typescript
export async function getTasksForDate(
  auth: OAuth2Client,
  date: string
): Promise<DailyTaskEvent | null> {
  const calendar = google.calendar({ version: 'v3', auth });
  
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date(`${date}T00:00:00Z`).toISOString(),
    timeMax: new Date(`${date}T23:59:59Z`).toISOString(),
    privateExtendedProperty: 'appId=dailyTasksTracker',
    maxResults: 1
  });
  
  if (!response.data.items || response.data.items.length === 0) {
    return null;
  }
  
  const event = response.data.items[0];
  const tasksDataStr = event.extendedProperties?.private?.tasksData;
  
  if (!tasksDataStr) {
    throw new Error('Invalid event: missing tasksData');
  }
  
  const tasksData: TasksData = JSON.parse(tasksDataStr);
  const completedCount = tasksData.tasks.filter(t => t.completed).length;
  
  return {
    date,
    tasks: tasksData.tasks,
    completionRate: tasksData.completionRate,
    colorId: event.colorId || getColorId(completedCount),
    eventId: event.id!
  };
}
```

### 8.2 Session Management with HttpOnly Cookies

**Backend Session Setup:**
```typescript
// config/session.ts
import session from 'express-session';

export const sessionConfig = session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  },
  name: 'dailyTasks.sid' // Custom cookie name
});
```

**Auth Middleware:**
```typescript
// middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { google } from 'googleapis';

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.session.refreshToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    // Create OAuth2 client with refresh token
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    oauth2Client.setCredentials({
      refresh_token: req.session.refreshToken
    });
    
    // Attach to request
    req.auth = oauth2Client;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid session' });
  }
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      auth?: OAuth2Client;
    }
  }
}
```

### 8.3 Frontend Token Management

**Auth Context:**
```typescript
// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  async function checkAuthStatus() {
    try {
      const response = await api.get('/auth/status');
      if (response.data.authenticated) {
        setUser(response.data.user);
        // Get fresh access token
        const tokenRes = await api.post('/auth/refresh');
        setAccessToken(tokenRes.data.accessToken);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  }
  
  async function login(code: string) {
    const response = await api.post('/auth/google', { code });
    setUser(response.data.user);
    setAccessToken(response.data.accessToken);
  }
  
  async function logout() {
    await api.post('/auth/logout');
    setUser(null);
    setAccessToken(null);
  }
  
  async function refreshToken(): Promise<string> {
    const response = await api.post('/auth/refresh');
    setAccessToken(response.data.accessToken);
    return response.data.accessToken;
  }
  
  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      isAuthenticated: !!user,
      loading,
      login,
      logout,
      refreshToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

**Axios Interceptor for Token Refresh:**
```typescript
// services/api.ts
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true // Important for cookies!
});

// Add access token to requests
api.interceptors.request.use((config) => {
  const token = /* get from auth context */;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 by refreshing token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const { refreshToken } = useAuth();
        const newToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

### 8.4 React Big Calendar Integration

**Calendar View Component:**
```typescript
// components/Calendar/CalendarView.tsx
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { HEX_COLORS } from '../../utils/colorMap';

const localizer = momentLocalizer(moment);

export function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Load month data
  useEffect(() => {
    loadMonthData(new Date());
  }, []);
  
  async function loadMonthData(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const response = await api.get(`/calendar/month/${year}/${month}`);
    
    const calendarEvents = response.data.dates.map((d: any) => ({
      title: `${d.completedCount}/6`,
      start: new Date(d.date),
      end: new Date(d.date),
      allDay: true,
      resource: {
        date: d.date,
        completedCount: d.completedCount,
        colorId: d.colorId,
        eventId: d.eventId
      }
    }));
    
    setEvents(calendarEvents);
  }
  
  return (
    <div className="h-screen p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '80vh' }}
        views={['month']}
        defaultView="month"
        onSelectSlot={(slotInfo) => setSelectedDate(slotInfo.start)}
        selectable
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: HEX_COLORS[event.resource.completedCount],
            borderColor: HEX_COLORS[event.resource.completedCount],
            color: event.resource.completedCount <= 2 ? '#ffffff' : '#000000',
            border: 'none',
            borderRadius: '4px',
            padding: '2px 5px',
            fontSize: '12px',
            fontWeight: 'bold'
          }
        })}
      />
      
      {selectedDate && (
        <TaskPanel
          date={selectedDate}
          isOpen={!!selectedDate}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
```

**Custom Styling (override React Big Calendar):**
```css
/* styles/calendar.css */

/* Make date cells clickable */
.rbc-month-view .rbc-day-bg {
  cursor: pointer;
  transition: background-color 0.2s;
}

.rbc-month-view .rbc-day-bg:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Highlight today */
.rbc-today {
  background-color: #e3f2fd !important;
  border: 2px solid #2196f3 !important;
}

/* Event styling */
.rbc-event {
  font-size: 0.875rem;
  padding: 2px 5px;
}

/* Remove default event colors */
.rbc-event.rbc-selected {
  background-color: inherit;
}
```

---

## 9. SETUP INSTRUCTIONS FOR README

```markdown
# Daily Tasks Google Calendar App

Track your daily tasks with automatic color-coding on Google Calendar.

## Features
- 📅 6 tasks per day with automatic color progression
- 🎨 Visual color-coding: Gray → Red → Orange → Yellow → Green
- 🔄 Real-time sync with Google Calendar
- 🔒 Secure OAuth 2.0 authentication
- 💾 Data stored in Google Calendar Extended Properties (no separate database needed)

## Prerequisites
- Node.js 18+
- npm 9+
- Google account
- Google Cloud Project with Calendar API enabled

## Google Cloud Setup

### 1. Create Google Cloud Project
1. Go to https://console.cloud.google.com/
2. Click "New Project"
3. Name: "Daily Tasks Tracker"
4. Click "Create"

### 2. Enable Google Calendar API
1. In your project, go to "APIs & Services" > "Library"
2. Search "Google Calendar API"
3. Click "Enable"

### 3. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure OAuth consent screen:
   - User Type: External
   - App name: Daily Tasks Tracker
   - Add your email as test user
4. Create OAuth Client:
   - Application type: Web application
   - Name: Daily Tasks Web Client
   - Authorized JavaScript origins: `http://localhost:3001`
   - Authorized redirect URIs: `http://localhost:5002/auth/google/callback`
5. Download credentials (Client ID and Secret)

## Installation

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd daily-tasks-app
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your Google credentials:
```bash
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
SESSION_SECRET=generate_random_32_char_string
```

Generate session secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Start backend:
```bash
npm run dev
```
Backend runs on http://localhost:5002

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
```

Edit `.env`:
```bash
VITE_API_URL=http://localhost:5002
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

Start frontend:
```bash
npm run dev
```
Frontend runs on http://localhost:3001

## Usage

1. Navigate to http://localhost:3001
2. Click "Sign in with Google"
3. Grant calendar permissions
4. Click any date to add/edit tasks
5. Check off tasks to see colors change!

## Color Scheme
- 🟢 Green (6/6) - All done!
- 🟢 Pale Green (5/6) - Almost there
- 🟡 Yellow (4/6) - Good progress
- 🟠 Orange (3/6) - Halfway
- 🔴 Pale Red (2/6) - Getting started
- 🔴 Red (1/6) - Just beginning
- ⚫ Gray (0/6) - Not started

## Troubleshooting

**"Error 401: invalid_client"**
- Check that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Verify redirect URI matches exactly: `http://localhost:5002/auth/google/callback`

**"Calendar API has not been used"**
- Enable Google Calendar API in Google Cloud Console
- Wait a few minutes for changes to propagate

**Session not persisting**
- Clear cookies and try again
- Check that `withCredentials: true` is set in Axios config

## Development

```bash
# Backend (with auto-reload)
cd backend && npm run dev

# Frontend (with HMR)
cd frontend && npm run dev

# Build for production
cd backend && npm run build
cd frontend && npm run build
```

## Tech Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Big Calendar
- **Backend:** Node.js, Express, TypeScript, Google APIs
- **Storage:** Google Calendar Extended Properties (no database!)
```

---

## 10. TESTING CHECKLIST

Before considering complete, manually test:

### Authentication
- [ ] Click "Sign in with Google" redirects to Google
- [ ] After granting permissions, redirects back to app
- [ ] User info displays correctly (name, email, picture)
- [ ] Session persists after page refresh
- [ ] "Logout" button destroys session
- [ ] Cannot access /tasks without authentication

### Task Management
- [ ] Can create 6 tasks for today
- [ ] Can create 6 tasks for future date
- [ ] Can create 6 tasks for past date
- [ ] Cannot add 7th task (blocked)
- [ ] Checking task immediately updates Google Calendar color
- [ ] Unchecking task updates color correctly
- [ ] Editing task title saves to Extended Properties
- [ ] Opening date with existing tasks loads them

### Color Accuracy
- [ ] 0/6 completed = Gray (#5A5A5A)
- [ ] 1/6 completed = Red (#DC2127)
- [ ] 2/6 completed = Pale Red (#FF887C)
- [ ] 3/6 completed = Orange (#FFB878)
- [ ] 4/6 completed = Yellow (#FBD75B)
- [ ] 5/6 completed = Pale Green (#7AE7BF)
- [ ] 6/6 completed = Green (#51B749)
- [ ] Frontend calendar matches Google Calendar exactly

### Calendar UI
- [ ] Current month displays correctly
- [ ] Can navigate to previous/next month
- [ ] Today's date is highlighted
- [ ] Dates with tasks show colored backgrounds
- [ ] Clicking date opens Task Panel
- [ ] Clicking outside Task Panel closes it
- [ ] ESC key closes Task Panel

### Error Handling
- [ ] Network errors show user-friendly message
- [ ] Invalid date format returns 400 error
- [ ] Expired token automatically refreshes
- [ ] API rate limit shows retry message

### Edge Cases
- [ ] No duplicate events created for same date
- [ ] Handles rapid clicking (debounce)
- [ ] Works on mobile (responsive)
- [ ] Works with slow internet (loading states)

---

## 11. CRITICAL RULES

**Security:**
1. ✅ NEVER store Client Secret in frontend
2. ✅ ALWAYS use HttpOnly cookies for sessions
3. ✅ ALWAYS validate inputs on backend
4. ✅ NEVER commit .env files
5. ✅ Use helmet middleware for security headers

**Data Integrity:**
6. ✅ ALWAYS enforce exactly 6 tasks per day
7. ✅ ONE calendar event per date maximum
8. ✅ Search before creating to prevent duplicates
9. ✅ Validate task titles <= 100 characters
10. ✅ Use UUIDs for task IDs

**Best Practices:**
11. ✅ Use TypeScript for type safety
12. ✅ Handle all async errors with try/catch
13. ✅ Show loading states for all API calls
14. ✅ Implement optimistic UI updates
15. ✅ Document all API endpoints

---

## 12. USEFUL DOCUMENTATION LINKS

**CRITICAL - REFERENCE THESE DURING DEVELOPMENT:**

1. **Google Calendar API:**
   - Main docs: https://developers.google.com/calendar/api/v3/reference
   - Extended Properties guide: https://developers.google.com/calendar/api/guides/extended-properties
   - Node.js quickstart: https://developers.google.com/calendar/api/quickstart/nodejs
   - OAuth 2.0 setup: https://developers.google.com/identity/protocols/oauth2/web-server
   - Events reference: https://developers.google.com/calendar/api/v3/reference/events
   - Colors reference: https://developers.google.com/calendar/api/v3/reference/colors

2. **Google API Client (Node.js):**
   - npm package: https://www.npmjs.com/package/googleapis
   - GitHub repo: https://github.com/googleapis/google-api-nodejs-client
   - Authentication docs: https://github.com/googleapis/google-api-nodejs-client#authentication-and-authorization

3. **React & Frontend:**
   - React Big Calendar: https://github.com/jquense/react-big-calendar
   - React Big Calendar Docs: http://jquense.github.io/react-big-calendar/examples/
   - @react-oauth/google: https://www.npmjs.com/package/@react-oauth/google
   - Axios: https://axios-http.com/docs/intro
   - React Router: https://reactrouter.com/en/main

4. **TypeScript:**
   - TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/intro.html
   - Express TypeScript: https://expressjs.com/en/resources/glossary.html
   - Google APIs TypeScript: https://github.com/googleapis/google-api-nodejs-client#typescript

5. **Tailwind CSS:**
   - Docs: https://tailwindcss.com/docs
   - React setup: https://tailwindcss.com/docs/guides/vite

---

## 13. BUILD ORDER (Recommended Steps)

**Phase 1: Project Setup (30 min)**
1. Create project folders
2. Initialize npm in both backend and frontend
3. Install all dependencies
4. Setup TypeScript configs
5. Create .env.example files
6. Setup .gitignore

**Phase 2: Google Cloud Setup (20 min)**
7. Create Google Cloud Project
8. Enable Calendar API
9. Create OAuth 2.0 credentials
10. Test credentials in OAuth Playground

**Phase 3: Backend Auth (2 hours)**
11. Setup Express server with TypeScript
12. Configure express-session
13. Create OAuth2 config
14. Build /auth/google endpoint
15. Build /auth/refresh endpoint
16. Build /auth/status endpoint
17. Build /auth/logout endpoint
18. Test with Postman/Thunder Client

**Phase 4: Google Calendar Service (2 hours)**
19. Create googleCalendarService.ts
20. Implement createOrUpdateTaskEvent()
21. Implement getTasksForDate()
22. Implement getMonthData()
23. Test manually with Postman

**Phase 5: Tasks API (1.5 hours)**
24. Build POST /tasks/:date
25. Build GET /tasks/:date
26. Build PATCH /tasks/:date/:taskId/toggle
27. Build PATCH /tasks/:date/:taskId/title
28. Build PUT /tasks/:date
29. Add validation middleware

**Phase 6: Frontend Auth (1.5 hours)**
30. Setup Vite + React + TypeScript
31. Create AuthContext
32. Build LoginPage
33. Implement Google OAuth popup
34. Test auth flow end-to-end

**Phase 7: Calendar UI (2 hours)**
35. Install React Big Calendar
36. Create CalendarView component
37. Implement color mapping
38. Add month navigation
39. Style with Tailwind

**Phase 8: Task Panel (2 hours)**
40. Create TaskPanel modal
41. Build TaskList component
42. Build TaskItem component
43. Connect to API endpoints
44. Add loading states

**Phase 9: Integration & Polish (2 hours)**
45. Test full flow end-to-end
46. Add error handling
47. Add loading spinners
48. Implement optimistic updates
49. Test all 7 color states
50. Mobile responsive testing

**Total estimated time: 14-16 hours**

---

## 14. SUCCESS CRITERIA

✅ **Authentication**
- User can sign in with Google
- Session persists across page refreshes
- User can logout successfully

✅ **Task Management**
- User can create 6 tasks for any date
- Tasks save to Google Calendar Extended Properties
- Checking/unchecking tasks updates immediately

✅ **Color System**
- All 7 color states work correctly (0/6 through 6/6)
- Frontend calendar matches Google Calendar colors exactly
- Colors update automatically when tasks change

✅ **UI/UX**
- Calendar displays current month
- Clicking dates opens task panel
- Task panel is responsive and user-friendly
- Loading states show during API calls
- Errors display helpful messages

✅ **Code Quality**
- TypeScript with no type errors
- All API endpoints documented
- Error handling on all async operations
- .env files not committed to git

---

## FINAL NOTES

**When Stuck:**
- Check Google Calendar API docs for Extended Properties
- Test OAuth flow in Google OAuth 2.0 Playground
- Use Thunder Client/Postman to test backend endpoints directly
- Check browser console for frontend errors
- Verify session cookies are being set (check DevTools > Application > Cookies)

**Common Pitfalls to Avoid:**
1. Forgetting `withCredentials: true` in Axios (breaks cookie-based auth)
2. Not searching for existing events before creating (creates duplicates)
3. Storing Client Secret in frontend code (security risk)
4. Not handling 401 errors with token refresh (breaks on token expiry)
5. Hardcoding color IDs instead of using mapping function (breaks color system)

**After MVP is Complete:**
- Deploy frontend to Netlify
- Deploy backend to Railway/Render
- Update OAuth redirect URIs in Google Cloud Console
- Test production deployment thoroughly

---

**Good luck building! 🚀**
