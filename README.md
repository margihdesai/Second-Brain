# 🧠 Second Brain

A shared household kanban board — built for couples and families to offload tasks, ideas, worries, purchases, trips, and life admin into one place that syncs in real-time across all devices.

## Live app
**[https://margihdesai.github.io/Second-Brain/second-brain.html](https://margihdesai.github.io/Second-Brain/second-brain.html)**

## Landing page
**[https://margihdesai.github.io/Second-Brain/](https://margihdesai.github.io/Second-Brain/)**

---

## Features

### Core board
- **Google Sign-In** — sign in with any Google account
- **Households** — create a shared board and invite others with a 6-letter code
- **Real-time sync** — changes appear instantly on all devices via Firebase
- **Kanban board** — 8 columns: Tasks ✅, Worries 💭, Ideas 💡, Purchases 🛒, Trips ✈️, Life Admin 📋, Other 📝, Completed ☑️
- **Drag & drop** — move cards between columns by dragging
- **Acknowledge cards** — tap 👋 to let someone know you've seen their item
- **Mark complete** — tick ✓ to move a card to the Completed column
- **Reassign** — move a card to a different column via the ⇢ button
- **Delete** — remove a card with the × button

### Smart chat
- **NLP categorisation** — type anything in the chat, the app figures out which column it belongs in using score-based keyword matching
- **Voice input** — tap 🎤 and speak instead of typing (Web Speech API, Chrome/Safari)
- **Chat commands** — "summary", "how many items?", "show [name]'s tasks", "undo", and more

### Card details
- **Due dates** — set an optional due date on any card; overdue cards are highlighted in red
- **Notes** — click any card to open a detail view and add free-form notes, links, or context
- **Card detail modal** — shows full text, due date picker, notes textarea, and who added it

### Invites & sharing
- **Invite link** — share a direct join link (`?code=XXXXXX`) that pre-fills the invite code for the recipient
- **Email invite** — enter a recipient's email in the Invite modal; opens your email app with a pre-written message containing the join link
- **Copy link** — one-click copy of the shareable join URL

### Insights & analytics
- **Insights screen** — completion rate ring, overdue count, active items by category, contributions per member
- **Weekly digest** — summary of everything added in the past 7 days
- **Founder dashboard** — admin-only view (visible to the founder) showing total users, active users, feature usage bar charts, new signups per day, and a full user table with first/last seen dates

### Mobile
- **Tab-based layout** — on phones, columns become tabs so the board is easy to navigate
- **Always-visible actions** — card buttons (complete, reassign, delete) are always visible on mobile

---

## Tech stack
- Plain HTML/CSS/JS — no framework, no build tools
- Firebase Realtime Database — real-time sync across all devices
- Firebase Authentication — Google Sign-In, open to any Google account
- Firebase Analytics path — usage event tracking for the founder dashboard
- Web Speech API — voice input in the chat
- Hosted on GitHub Pages

---

## How to contribute
1. Clone the repo
2. Edit `second-brain.html` (the app) or `index.html` (the landing page)
3. Push to `main` — GitHub Pages deploys automatically in ~1 min

> Note: `index.html` is the public landing page. The app lives at `second-brain.html`. They are separate files.

For full context on architecture, data structure, Firebase config, and design decisions, see [CLAUDE.md](./CLAUDE.md).

---

*Built by [Margi Desai](https://github.com/margihdesai) · Built with Claude AI*
