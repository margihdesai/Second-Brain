# 🧠 Second Brain

A shared household kanban board — built for couples and families to offload tasks, ideas, worries, purchases, trips, and life admin into one place that syncs in real-time across all devices.

**[https://margihdesai.github.io/Second-Brain/app/](https://margihdesai.github.io/Second-Brain/app/)**

---

## Features

### Board
- **Google Sign-In** — sign in with any Google account
- **Households** — create a shared board and invite others with a 6-letter code
- **Real-time sync** — changes appear instantly on all devices via Firebase
- **Kanban board** — 8 columns: Tasks ✅, Worries 💭, Ideas 💡, Purchases 🛒, Trips ✈️, Life Admin 📋, Other 📝, Completed ☑️
- **Drag & drop** — move cards between columns
- **Acknowledge cards** — tap 👋 to let someone know you've seen their item
- **Mark complete** — tick ✓ to move a card to the Completed column
- **Quick-add bar** — type at the top of the board; AI detects the category in real-time

### AI chat
- **Claude-powered** — type anything naturally; the assistant understands intent, categorises entries, and answers questions about the board
- **Board queries** — ask "how many tasks?", "show my purchases", "what did Margi add?" and get answers from live data
- **Conversational** — follow-up questions work ("what is it?", "show me") using conversation context
- **Undo** — "scratch that" removes your last entry

### Card details
- **Due dates** — set an optional due date; overdue cards are highlighted
- **Notes** — click any card to open a detail view and add free-form notes or links

### Sharing
- **Invite link** — share a direct join link that pre-fills the invite code
- **Copy link** — one-click copy of the shareable URL

---

## Tech stack
- React + TypeScript + Vite
- Firebase Realtime Database — real-time sync
- Firebase Authentication — Google Sign-In
- Cloudflare Worker — proxies Claude Haiku for AI categorisation and chat
- GitHub Pages + GitHub Actions — CI/CD

---

## Local development
```bash
cd app
npm install
npm run dev
```

Set `VITE_CATEGORISE_WORKER_URL` in `app/.env.local` to enable AI features locally.

## Deploy
Push to `main` — GitHub Actions builds the React app and deploys to GitHub Pages automatically.

---

*Built by [Margi Desai](https://github.com/margihdesai) · Built with Claude AI*
