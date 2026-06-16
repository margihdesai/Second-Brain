# Second Brain — Claude Code Context

## What this is
A shared household kanban board. Couples or families sign in with Google, create a board, invite members via a 6-letter code, and collaboratively manage tasks, ideas, worries, purchases, trips, and life admin. Data syncs in real-time across all devices.

## Repo structure
```
/                     → GitHub Pages root
  index.html          → Public landing page (plain HTML/CSS/JS)
  story.html          → Product story page (plain HTML/CSS/JS)
  LICENSE             → MIT
  README.md
  CLAUDE.md           → This file
  app/                → React app (Vite + TypeScript)
    src/
      App.tsx         → Root component, all modals, demo mode
      hooks/
        useAuth.ts    → Firebase Auth (Google Sign-In)
        useHousehold.ts → Board data, CRUD, publicStats tracking
      components/
        Auth/LoginScreen.tsx
        Setup/SetupScreen.tsx
        Header/Header.tsx
        Board/Board.tsx, Card.tsx, BoardSkeleton.tsx
        Chat/Chat.tsx
      firebase/config.ts  → Firebase init (modular SDK)
      types/index.ts      → Shared TypeScript types
      utils/detectCat.ts  → Score-based NLP categorisation
```

## Tech stack
- **Landing page / story** — plain HTML/CSS/JS, no framework, no build step
- **App** — React + TypeScript + Vite, in `/app/`
- **Firebase Realtime Database** — real-time sync (modular SDK v10)
- **Firebase Authentication** — Google Sign-In (`signInWithPopup`)
- **GitHub Pages** — static hosting
- **Cloudflare Worker** — `second-brain-categorise.margihdesai.workers.dev` — AI categorisation proxy (POST only). Set via `VITE_CATEGORISE_WORKER_URL` in `app/.env.production`. Falls back to keyword matching if unavailable.

## Firebase project
- **Project ID:** `second-brain-1619f`
- **Database URL:** `https://second-brain-1619f-default-rtdb.firebaseio.com`
- **Auth domain:** `second-brain-1619f.firebaseapp.com`
- **Authorised domain for Google Sign-In:** `margihdesai.github.io`
- **Firebase SDK version:** `10.7.0` (modular, imported via npm in the React app)

## URLs
- **Landing page:** `https://margihdesai.github.io/Second-Brain/`
- **Story page:** `https://margihdesai.github.io/Second-Brain/story.html`
- **App:** `https://margihdesai.github.io/Second-Brain/app/`
- **Demo:** `https://margihdesai.github.io/Second-Brain/app/?demo=true`
- **Join via invite:** `https://margihdesai.github.io/Second-Brain/app/?code=XXXXXX`

## Firebase data structure
```
/userHouseholds/{uid}                    → householdId (string)
/inviteCodes/{code}                      → householdId (string)

/households/{householdId}/
  name: string
  inviteCode: string                     6-char uppercase
  createdAt: ISO string
  createdBy: uid
  members/{uid}/
    displayName: string
    email: string
    color: string                        hex, from MEMBER_COLORS array
    joinedAt: ISO string
    role: 'admin' | 'member'
  entries/{entryId}/
    id: string
    text: string
    author: string                       displayName
    category: string                     task|worry|idea|purchase|trip|life-admin|other
    ts: ISO string
    acked: boolean
    ackedBy: string|null
    completed: boolean
    completedBy: string|null
    completedAt: ISO string|null
    dueDate: string|null                 YYYY-MM-DD
    notes: string

/publicStats/
  households: number                     incremented on createBoard
  users: number                          incremented on createBoard + joinBoard
  entries: number                        incremented on addEntry

/analytics/
  users/{uid}/                           lastSeen, firstSeen, email, displayName
  events/{pushId}/                       type, uid, ts
```

## Firebase database rules (currently published)
```json
{
  "rules": {
    "userHouseholds": {
      "$uid": { ".read": "$uid === auth.uid", ".write": "$uid === auth.uid" }
    },
    "inviteCodes": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "households": {
      "$hid": {
        ".read": "auth != null && data.child('members').child(auth.uid).exists()",
        ".write": "auth != null && (!data.exists() || data.child('members').child(auth.uid).exists())"
      }
    },
    "publicStats": { ".read": true, ".write": "auth != null" },
    "analytics": {
      ".read": "auth.token.email === 'margihdesai@gmail.com'",
      ".write": "auth != null"
    }
  }
}
```

## Key architecture decisions
- **React + Vite** — migrated from single HTML file; app lives in `/app/`, landing and story pages remain plain HTML
- **Modular Firebase SDK** — `import { ref, get, set, ... } from 'firebase/database'` (not compat)
- **`signInWithPopup`** — redirect failed silently in earlier version
- **Score-based NLP** — `utils/detectCat.ts` uses keyword arrays per category, picks highest score
- **`completed` flag** — marking complete sets `completed: true`, preserves original category
- **`inviteCodes/{code}` path** — separate lookup path for fast join-by-code without scanning all households
- **`publicStats` transactions** — `runTransaction` for safe concurrent counter increments
- **Demo mode** — `?demo=true` renders `DemoApp` component with hardcoded entries, no Firebase auth

## Demo mode
`DemoApp` in `App.tsx` is rendered when `?demo=true` is in the URL. It:
- Skips auth entirely
- Uses hardcoded `DEMO_ENTRIES` and `DEMO_HOUSEHOLD`
- Shows a banner with ← Home and Create your own board →
- All interactions (add, complete, delete, reassign) work locally via React state only

## Features
- Google Sign-In (any Google account)
- Multi-household with invite codes + shareable `?code=` links
- Real-time sync via Firebase Realtime Database
- Kanban board: Tasks ✅, Worries 💭, Ideas 💡, Purchases 🛒, Trips ✈️, Life Admin 📋, Other 📝, Completed ☑️
- Chat with score-based NLP categorisation
- Voice input (Web Speech API)
- Drag and drop between columns
- Acknowledge (👋) cards from other members
- Mark complete (✓)
- Due dates + overdue highlighting
- Card detail modal with notes
- Weekly digest modal
- Insights modal (completion rate, overdue, by category, by member)
- Email invite via mailto:
- Admin board actions (leave, delete, promote)
- Live stats on landing page (publicStats, real-time)
- Founder analytics dashboard (margihdesai@gmail.com only)

## GitHub & deployment
- **Repo:** `https://github.com/margihdesai/Second-Brain`
- **Deploy:** push to `main` → GitHub Pages auto-deploys landing/story pages in ~1 min
- **React app:** must be built (`npm run build` in `/app/`) and output committed to deploy app changes
- **GitHub PAT** — stored locally, never committed. Set on remote URL temporarily for push, then removed immediately
- **Admin email:** `margihdesai@gmail.com` — only this account sees the founder dashboard

## What's planned / not yet built
- Custom domain
- Push notifications
- Claude API for smarter chat (needs API key proxy — Firebase Cloud Functions)
- WhatsApp integration (needs Meta Business API + Cloud Functions webhook)
- Mobile swipe gestures
