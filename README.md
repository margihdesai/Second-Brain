# 🧠 Second Brain

A shared household kanban board — built for couples and families to offload tasks, ideas, worries, purchases, trips, and life admin into one place that syncs in real-time across all devices.

## Live links
| | |
|---|---|
| **Landing page** | https://margihdesai.github.io/Second-Brain/ |
| **App** | https://margihdesai.github.io/Second-Brain/app/ |
| **Demo** (no sign-in) | https://margihdesai.github.io/Second-Brain/app/?demo=true |
| **Story** | https://margihdesai.github.io/Second-Brain/story.html |

---

## Features

### Board
- **Google Sign-In** — any Google account, no whitelist
- **Households** — create a shared board and invite others with a 6-letter code or shareable link
- **Real-time sync** — changes appear instantly on all devices via Firebase
- **Kanban columns** — Tasks ✅, Worries 💭, Ideas 💡, Purchases 🛒, Trips ✈️, Life Admin 📋, Other 📝, Completed ☑️
- **Drag & drop** — move cards between columns
- **Acknowledge cards** — tap 👋 to let someone know you've seen their item
- **Mark complete** — tick ✓ moves a card to Completed

### Smart chat
- **NLP categorisation** — type anything naturally; score-based keyword matching picks the right column automatically
- **Voice input** — tap 🎤 and speak instead of typing (Web Speech API)
- **Chat commands** — "summary", "how many items?", "show Margi's tasks", "undo", and more

### Card details
- **Due dates** — set an optional due date; overdue cards highlighted in red
- **Notes** — click any card to open a detail view and add free-form notes or links

### Sharing & invites
- **Invite link** — share a direct join link (`?code=XXXXXX`) that pre-fills the invite code
- **Email invite** — opens your email app with a pre-written invite message
- **Copy link** — one-click copy of the shareable URL

### Insights & analytics
- **Insights screen** — completion rate, overdue count, active items by category, contributions per member
- **Weekly digest** — summary of everything added in the past 7 days
- **Founder dashboard** — admin-only view showing total users, feature usage, signups per day, and a full user table

### Demo & landing page
- **Demo mode** — try a pre-populated board with no sign-in at `?demo=true`
- **Live stats** — landing page shows real-time boards created, items captured, and members joined from Firebase

---

## Tech stack
- React + TypeScript + Vite
- Firebase Realtime Database — real-time sync
- Firebase Authentication — Google Sign-In
- GitHub Pages + GitHub Actions — CI/CD, auto-deploys on push to `main`
- Web Speech API — voice input
- Plain HTML/CSS — landing page and story page (no framework)

---

## Local development
```bash
cd app
npm install
npm run dev
```

## Deploy
Push to `main` — GitHub Actions builds the React app and deploys everything to GitHub Pages automatically in ~1 min.

---

## How to contribute
1. Clone the repo
2. Edit files in `app/src/` for the board app, or `index.html` / `story.html` for the landing and story pages
3. Push to `main` — GitHub Pages deploys automatically

---

*Built by [Margi Desai](https://github.com/margihdesai) · Built with Claude AI · [MIT License](./LICENSE)*
