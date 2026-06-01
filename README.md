# sshLite

Web-based remote terminal for your **home PC**. Log in from any browser and run a shell on the machine where the server runs.

**Stack:** Node.js, Express, JWT, Socket.IO, node-pty, xterm.js

**Docs for learning / interviews:** `PROJECT_PLAN.txt`, `INTERVIEW_QUESTIONS.txt`

---

## Prerequisites (home PC)

- **Node.js 18+** — [https://nodejs.org](https://nodejs.org)
- **Linux or macOS** recommended (node-pty needs a real shell)
- **ngrok** or **Cloudflare Tunnel** for access from outside your home network

---

## Step 1 — Configure environment

```bash
cd sshLite
cp .env.example .env
```

Edit `.env`:

| Variable | Purpose |
|----------|---------|
| `PORT` | Server port (default `3000`) |
| `JWT_SECRET` | Signs login tokens — must be random and private |
| `ADMIN_USER` | Web login username |
| `ADMIN_PASSWORD` | Web login password |

Example — generate a secret:

```bash
openssl rand -hex 32
```

Put the output in `JWT_SECRET`. Set a strong `ADMIN_PASSWORD`.

---

## Step 2 — Install and run (home PC)

```bash
npm install
npm start
```

You should see: `sshLite running on http://localhost:3000` (or your `PORT`).

**Test locally:**

1. Open `http://localhost:3000` (use your `PORT` if different)
2. Log in with `ADMIN_USER` / `ADMIN_PASSWORD`
3. Run `pwd` or `ls` in the terminal

---

## Step 3 — Access from anywhere (tunnel)

Your home router does not expose your PC to the internet directly. A **tunnel** gives you a public HTTPS URL that forwards to your local server.

### Option A — ngrok (easiest for demos)

1. Sign up at [https://ngrok.com](https://ngrok.com) and install the CLI
2. Authenticate: `ngrok config add-authtoken YOUR_TOKEN`
3. With sshLite running, in another terminal:

```bash
ngrok http 3000
```

Use the **https://….ngrok-free.app** URL (replace `3000` with your `PORT` from `.env`).

4. On phone/laptop anywhere: open that URL → login → terminal

### Option B — Cloudflare Tunnel (free, no random URL changes if configured)

1. Install `cloudflared`
2. Run a tunnel pointing to `http://localhost:3000`
3. Use the hostname Cloudflare gives you

Details: [Cloudflare Tunnel docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)

---

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/status` | Health check |
| POST | `/api/login` | Body: `{ "username", "password" }` → `{ "token" }` |

Terminal uses Socket.IO with `auth: { token: "<JWT>" }`.

---

## Project layout

```
sshLite/
├── PROJECT_PLAN.txt           # Build steps & architecture
├── INTERVIEW_QUESTIONS.txt    # Q&A per step (resume prep)
├── .env.example               # Template → copy to .env
├── public/                    # Login + terminal UI
└── src/
    ├── server.js
    ├── auth/auth.js
    └── websocket/socket.js
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `EADDRINUSE` | Change `PORT` in `.env` or stop the other process on that port |
| Login fails | Check `ADMIN_USER` / `ADMIN_PASSWORD` in `.env`; restart server after edits |
| Terminal "Connection failed" | Token expired (12h) — log in again; check server is running |
| ngrok works but terminal blank | Same `PORT` in `.env` and `ngrok http PORT` |
| `forkpty failed` | Run on Linux/macOS with a normal user shell; not all sandboxes/CI support PTY |

---

## Security checklist

- [ ] Strong `ADMIN_PASSWORD` and random `JWT_SECRET`
- [ ] `.env` is in `.gitignore` — never push secrets
- [ ] Stop `npm start` when you do not need remote access
- [ ] Do not share your ngrok URL publicly without trusting recipients
- [ ] Tunnel adds HTTPS; your app still needs login

---

## Resume one-liner

*Built a web-based remote shell (Node.js, WebSockets, JWT) with tunnel-based access to a home machine from any network.*
