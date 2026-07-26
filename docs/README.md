# Chalo Dekhe Bharat! 🇮🇳

**Your Interactive Passport to Incredible India**

> *Explore • Experience • Collect • Travel*

A hackathon submission — a full-stack tourism platform where users build a **Digital Passport** as they explore a Museum, browse a Gallery, play Mini-Games, and receive an AI-generated itinerary. XP, badges, and stamps carry across every page through a shared PassportContext.

---

## ✨ Features

| Feature | Description | Hackathon Deliverable |
|---------|-------------|----------------------|
| 🏛️ Digital Museum | Era-based rooms (Ancient → Modern), Historical/Story mode toggle, narration, Heritage Stamps | Interactive cultural content |
| 🖼️ Photo Gallery | 5 categories, scroll animations, Day/Night toggle, ambient sound, bookmarking | Visual exploration |
| 🎮 Mini-Games | Guess the Monument, Find the State (SVG map), Match Festivals | Gamification |
| 🤖 AI Planner | Groq-powered itinerary biased by your Passport exploration history | AI integration |
| 📖 Passport Dashboard | XP, level, badges, stamps, wishlist, planner history, visited-states map | Progress & personalization |

---

## 🚀 Setup & Running Locally

### Prerequisites
- Node.js 18+
- npm 9+
- A [Groq API key](https://console.groq.com) (free tier available)

### 1. Clone & Install

```bash
git clone <repo-url>
cd chalo-dekhe-bharat
npm install
```

### 2. Configure Environment

```bash
cd server
cp .env.example .env
# Edit .env and set your GROQ_API_KEY
```

### 3. Run Development Servers

```bash
# From the root — starts both client (port 5173) and server (port 3001)
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173)

### 4. Run Client or Server Independently

```bash
npm run dev:client   # Only Vite client (port 5173)
npm run dev:server   # Only Express server (port 3001)
```

---

## 🔑 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | ✅ Yes | — | Groq API key for AI itinerary generation |
| `PORT` | ❌ No | `3001` | Express server port |
| `ALLOWED_ORIGIN` | ❌ No | `http://localhost:5173` | CORS allowed origin (set to your frontend URL in production) |

> ⚠️ **Security**: The `GROQ_API_KEY` is **only** read on the server. It is never sent to the client.

---

## 📁 Project Structure

```
chalo-dekhe-bharat/
├── client/                   # Vite + React frontend
│   ├── src/
│   │   ├── assets/           # Images, audio, icons
│   │   ├── components/       # Navbar, PassportWidget, XPToast, BadgeCard
│   │   ├── context/          # PassportContext.jsx (single source of truth)
│   │   ├── data/             # Static JSON datasets
│   │   ├── hooks/            # useLocalStorage, useXP, useStamps
│   │   ├── pages/            # Landing, Museum, Gallery, Games, Planner, Dashboard
│   │   ├── services/         # api.js (all backend calls)
│   │   └── App.jsx
│   ├── index.html
│   └── vite.config.js
├── server/                   # Express backend
│   ├── routes/planner.js     # POST /api/itinerary → Groq AI
│   ├── index.js
│   └── .env.example
└── docs/
    ├── README.md
    └── showcase-script.md
```

---

## 🔒 Security Notes

- API keys are server-side only (Express reads from `process.env`)
- Strict CORS allow-list (no wildcard `*`)
- Input validation on all API endpoints
- React JSX auto-escaping (no `dangerouslySetInnerHTML`)
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Cache-Control: no-store`
- Rate limiting on the AI endpoint (10 req/min per IP)

---

## 🎯 Hackathon Deliverables Mapping

- **Required Module 1** → Digital Museum (`/museum`)
- **Required Module 2** → Photo Gallery (`/gallery`)
- **AI Feature** → AI Travel Planner (`/planner`) with Groq + Passport personalization
- **Gamification** → Mini-Games (`/games`)
- **Data Persistence** → PassportContext + localStorage
- **Personalization** → Planner endpoint reads `passportContext` from request body

---

*Built with ❤️ for Incredible India*
