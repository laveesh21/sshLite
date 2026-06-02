# sshLite

Web-based remote terminal for your **home PC**. Log in from any browser and run a shell on the machine where the server runs.

**Stack:** React, Vite, Node.js, Express, JWT, Socket.IO, node-pty, xterm.js

---

## Prerequisites (home PC)

- **Node.js 18+** — [https://nodejs.org](https://nodejs.org)
- **Linux or macOS** recommended (node-pty needs a real shell)
- **ngrok** or **Cloudflare Tunnel** for access from outside your home network

---

## Step 1 — Configure environment

```bash
cd sshLite/server
cp .env.example .env
```

Edit `server/.env`:

| Variable | Purpose |
|----------|---------|
| `PORT` | Server port (default `3000`) |
| `JWT_SECRET` | Signs login tokens — must be random and private |
| `ADMIN_USER` | Web login username |
| `ADMIN_PASSWORD` | Web login password |

Generate a secret:

```bash
openssl rand -hex 32
```

---

## Step 2 — Install and run

All dependencies live in **`server/node_modules`** only.

```bash
cd server
npm install
npm run dev
```

- **UI (dev):** http://localhost:5173
- **API:** http://localhost:3000

Log in with `ADMIN_USER` / `ADMIN_PASSWORD`, then use the terminal.

### Production (single port)

```bash
cd server
npm run build
NODE_ENV=production npm start
```

Open http://localhost:3000 — the server serves the built React app and API together.

---

## Step 3 — Access from anywhere (tunnel)

With production mode running, point your tunnel at the server port:

```bash
ngrok http 3000
```

Use the **https://….ngrok-free.app** URL on any device → login → terminal.

---

## Project layout

```
sshLite/
└── server/
    ├── client/          # React + Vite frontend source
    │   └── src/
    ├── node_modules/    # all dependencies (single install)
    └── src/
        ├── server.js
        ├── auth/
        └── websocket/
```

---

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/status` | Health check |
| POST | `/api/login` | Body: `{ "username", "password" }` → `{ "token" }` |

Terminal uses Socket.IO with `auth: { token: "<JWT>" }`.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `EADDRINUSE` | Change `PORT` in `server/.env` or stop the other process |
| Login fails | Check credentials in `server/.env`; restart server |
| Terminal "Connection failed" | Token expired (12h) — log in again |
| Blank terminal in dev | Open **5173**, not 3000 — Vite proxies API/WebSocket |
| ngrok in dev | Tunnel port **3000** only works after `npm run build && NODE_ENV=production npm start` |
