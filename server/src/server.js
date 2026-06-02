import express from "express";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { login } from "./auth/auth.js";
import { setupWebSocket } from "./websocket/socket.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const clientDist = path.join(rootDir, "client", "dist");
const isProd = process.env.NODE_ENV === "production";

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;
const httpServer = http.createServer(app);

setupWebSocket(httpServer);

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    app: "sshLite",
    status: "running",
  });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  const result = login(username, password);

  if (!result.ok) {
    return res.status(401).json({ success: false, error: result.error });
  }

  res.json({ success: true, token: result.token });
});

if (isProd) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

httpServer.listen(port, () => {
  console.log(`sshLite API running on http://localhost:${port}`);
  if (isProd) {
    console.log(`sshLite UI served from ${clientDist}`);
  } else {
    console.log("Dev UI: http://localhost:5173");
  }
});
