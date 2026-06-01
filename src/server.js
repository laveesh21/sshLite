import express from "express";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { login } from "./auth/auth.js";
import { setupWebSocket } from "./websocket/socket.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const publicDir = path.join(rootDir, "public");

const app = express();
app.use(express.json());
app.use(express.static(publicDir));
app.use("/vendor/xterm", express.static(path.join(rootDir, "node_modules/@xterm/xterm")));
app.use("/vendor/addon-fit", express.static(path.join(rootDir, "node_modules/@xterm/addon-fit")));

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

httpServer.listen(port, () => {
  console.log(`sshLite running on http://localhost:${port}`);
});
