# Second Brain — Claude Code Context

## What this is
A shared household kanban board built as a single HTML file. Couples or families can sign in with Google, create a board, invite members via a 6-letter code, and collaboratively manage tasks, ideas, worries, purchases, trips, and life admin. Data syncs in real-time across all devices.

## Tech stack
- **Single file app** — `index.html` and `second-brain.html` are identical; both are committed so GitHub Pages serves `index.html` at the root URL
- **Firebase Realtime Database** — all board data, real-time sync
- **Firebase Authentication** — Google Sign-In, open to any Google account
- **GitHub Pages** — static hosting at `https://margihdesai.github.io/Second-Brain/`
- **No build tools** — plain HTML/CSS/JS, Firebase loaded via CDN

## Firebase project
- **Project ID:** `second-brain-1619f`
- **Database URL:** `https://second-brain-1619f-default-rtdb.firebaseio.com`
- **Auth domain:** `second-brain-1619f.firebaseapp.com`
- **Authorised domain for Google Sign-In:** `margihdesai.github.io`
- **Firebase SDK version:** `10.7.0` (compat mode, loaded via CDN)

## Firebase data structure
```
/userHouseholds/{uid}                    → householdId (string)

/households/{householdId}/
  name: string                           e.g. "Margi & Samarth"
  inviteCode: string                     6-char uppercase, e.g. "AB12CD"
  createdAt: ISO string
  createdBy: uid
  members/{uid}/
    displayName: string
    email: string
    color: string                        hex, assigned from MEMBER_COLORS array
    joinedAt: ISO string
  entries/{entryId}/
    id: string
    text: string
    author: string                       displayName of who added it
    category: string                     task|worry|idea|purchase|trip|life-admin|other
    ts: ISO string
    acked: boolean
    ackedBy: string|null
    completed: boolean
    completedBy: string|null
    completedAt: ISO string|null
```

## Firebase database rules
```json
{
  "rules": {
    "userHouseholds": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "households": {
      ".indexOn": ["inviteCode"],
      "$hid": {
        ".read": "auth != null && data.child('members').child(auth.uid).exists()",
        ".write": "auth != null && (!data.exists() || data.child('members').child(auth.uid).exists())"
      }
    }
  }
}
```

## Multi-household architecture
- Any Google user can sign in — no email whitelist
- On first sign-in, user is shown a setup screen: **Create board** or **Join board**
- **Create:** enters board name + display name → Firebase generates a household node + random 6-char invite code → user is stored as first member
- **Join:** enters invite code + display name → looked up via `orderByChild('inviteCode')` → user added as member
- `userHouseholds/{uid}` maps each user to their household ID
- `entriesRef` is set dynamically after household is loaded — it points to `/households/{hid}/entries`
- Member colours are assigned from `MEMBER_COLORS` array in order of joining

## Key design decisions made
- **Single HTML file** — no framework, no build step, easy to host anywhere
- **Firebase compat SDK** — used instead of modular SDK so `firebase.xxx()` works directly in script tags without imports
- **`signInWithPopup`** — chosen over `signInWithRedirect` after redirect failed silently (Firebase init was running after auth code)
- **Score-based categorisation** — chat uses keyword arrays per category, counts matches, picks highest score. Avoids first-match bias of single regex
- **`completed` flag, not category change** — marking complete adds `completed: true` to the entry rather than moving it to a different category, so the original category is preserved
- **No seed entries** — new households start with an empty board (seed data was removed when multi-household was added)
- **`entriesRef.off()` before reassigning** — prevents duplicate listeners if a user somehow triggers `loadHousehold` twice

## Features implemented
- Google Sign-In (any Google account)
- Multi-household with invite codes
- Real-time sync via Firebase Realtime Database
- Kanban board with 7 columns: Tasks ✅, Worries 💭, Ideas 💡, Purchases 🛒, Trips ✈️, Life Admin 📋, Other 📝, Completed ☑️
- Chat interface with score-based NLP categorisation
- Drag and drop between columns
- Acknowledge (👋) cards from other members
- Mark complete (✓) — moves card to Completed column with strikethrough
- Weekly digest modal
- Mobile-friendly layout with category tab bar (≤640px)
- 🔗 Invite button in header shows invite code and member list

## Chat commands supported
| Input | Action |
|---|---|
| "I need to call the dentist" | → Tasks ✅ |
| "undo" / "scratch that" | Removes last entry you added |
| "summary" / "show everything" | Count per category |
| "how many items?" | Total + unseen count |
| "show [member name]'s" | Lists what that member added |
| "show my tasks" | Lists task cards |
| "thanks" | Friendly response |

## GitHub & deployment
- **Repo:** `https://github.com/margihdesai/Second-Brain`
- **Hosted at:** `https://margihdesai.github.io/Second-Brain/`
- **Deploy:** push to `main` branch → GitHub Pages auto-deploys in ~1 min
- `index.html` and `second-brain.html` must always be kept in sync (copy one to the other before committing)
- GitHub PAT stored locally — not committed

## What's planned / not yet built
- Custom domain
- Push notifications when a member adds something
- Claude API integration for smarter chat categorisation (deferred — requires API key proxy)
- Mobile: swipe gestures between tabs
