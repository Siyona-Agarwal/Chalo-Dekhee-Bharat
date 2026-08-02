# Chalo Dekhe Bharat!

An interactive India travel experience built with React, Vite, Express, Clerk, and an AI itinerary planner.

The app includes:

- Digital Museum with era-based cultural exhibits
- Photo Gallery with categories, day/night views, bookmarks, and ambient audio
- Mini-games for monuments, states, and festivals
- Digital Passport with XP, badges, stamps, wishlist items, and visited states
- AI travel planner powered by NVIDIA's OpenAI-compatible API

## Requirements

- Node.js 20.19+ (or Node.js 22.12+)
- npm 10+
- Python 3.10+
- A Clerk application for sign-in/sign-up
- An NVIDIA API key for the AI itinerary planner

Check your versions:

```bash
node --version
npm --version
```

## Local setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd Chalo-Dekhee-Bharat
```

### 2. Install dependencies

Run this once from the repository root:

```bash
npm install
```

Because this is an npm workspace, the command installs both the React client and Express server dependencies.

### 3. Install the stories-service dependencies

The Explorer Stories feature uses the FastAPI service in `python-service/`:

```bash
python -m venv .venv
python -m pip install -r python-service/requirements.txt
```

On Windows PowerShell, activate the virtual environment before running the app:

```powershell
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, run the commands with the Python executable from `.venv` directly instead.

### 4. Configure the client

Copy the client environment template:

```bash
cp client/.env.example client/.env
```

On Windows PowerShell, use:

```powershell
Copy-Item client/.env.example client/.env
```

Open `client/.env` and set the publishable key from your Clerk application:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_STORIES_API_URL=http://localhost:3002
```

The frontend cannot start without this value because Clerk provides the sign-in and sign-up UI.

### 5. Configure the Node server

Copy the server environment template:

```bash
cp server/.env.example server/.env
```

On Windows PowerShell, use:

```powershell
Copy-Item server/.env.example server/.env
```

Set the NVIDIA key in `server/.env`:

```env
NVIDIA_API_KEY=your_nvidia_api_key_here
PORT=3001
ALLOWED_ORIGIN=http://localhost:5173
```

The AI planner returns a clear configuration error when `NVIDIA_API_KEY` is empty; the rest of the website remains available.

### 6. Configure the stories service

Copy the Python service environment template:

```bash
cp python-service/.env.example python-service/.env
```

On Windows PowerShell, use:

```powershell
Copy-Item python-service/.env.example python-service/.env
```

The defaults are suitable for local development. The service creates `stories.db` and `uploads/` at runtime and seeds community stories automatically.

### 7. Start the development app

From the repository root:

```bash
npm run dev
```

Open <http://localhost:5173> in your browser. The Express API runs at <http://localhost:3001>, the stories service runs at <http://localhost:3002>, and the Vite development server proxies `/api` requests to the Node server.

To run either service separately:

```bash
npm run dev:client
npm run dev:server
npm run dev:python
```

Verify the server is responding:

```bash
curl http://localhost:3001/api/health
curl http://localhost:3002/api/health
```

Expected response:

```json
{"status":"ok","timestamp":"..."}
```

## Production-style checks

Build the client:

```bash
npm run build
```

Check the server files:

```bash
npm run check:server
```

Start the server directly:

```bash
npm run start
```

To preview the built client in another terminal:

```bash
npm run preview --workspace=client
```

## Environment variables

### Client: `client/.env`

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | Initializes Clerk in the browser |
| `VITE_STORIES_API_URL` | No | Stories service URL; defaults to `http://localhost:3002` |

### Server: `server/.env`

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `NVIDIA_API_KEY` | For AI planner | — | NVIDIA API key for itinerary generation |
| `PORT` | No | `3001` | Express server port |
| `ALLOWED_ORIGIN` | No | `http://localhost:5173` | Comma-separated allowed frontend origins |
| `CLERK_PUBLISHABLE_KEY` | No | — | Enables server-side Clerk verification when paired with the secret key |
| `CLERK_SECRET_KEY` | No | — | Server-side Clerk secret |
| `REQUIRE_AUTH` | No | `false` | Set to `true` to require Clerk auth when the server is configured |

### Stories service: `python-service/.env`

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `CLERK_JWKS_URL` | No | — | Clerk JWKS endpoint; omit for local development mode |
| `DATABASE_URL` | No | `sqlite:///./stories.db` | SQLAlchemy database URL |
| `UPLOAD_DIR` | No | `./uploads` | Directory for uploaded story photos |
| `ALLOWED_ORIGIN` | No | `http://localhost:5173` | Allowed frontend origin |

Never put `NVIDIA_API_KEY` or `CLERK_SECRET_KEY` in client files. Vite exposes variables prefixed with `VITE_` to browser code.

## Project structure

```text
client/                 React + Vite frontend
client/src/data/        Static India, gallery, museum, game, and passport data
client/public/          Website images, icons, and game assets
server/                 Express API and AI itinerary route
server/routes/planner.js
                         Validates requests and normalizes AI responses
python-service/         FastAPI Explorer Stories service
python-service/seeds.py Seed community stories on first startup
```

## Notes

- Passport progress is stored in the browser with `localStorage`.
- The AI key is read only by the Express server and is never sent to the client.
- `.env` files, build output, Python caches, local SQLite databases, uploads, and dependencies are ignored by Git.
- All images currently under `client/public` are referenced by the application data or components and are intentionally retained.
