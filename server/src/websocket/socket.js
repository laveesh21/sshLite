import { Server } from "socket.io";
import pty from "node-pty";
import { verifyToken } from "../auth/auth.js";

export function setupWebSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token || !verifyToken(token)) {
      return next(new Error("Unauthorized"));
    }
    next();
  });

  io.on("connection", (socket) => {
    const shell = process.env.SHELL || "bash";
    let ptyProcess;

    try {
      ptyProcess = pty.spawn(shell, [], {
        name: "xterm-color",
        cols: 80,
        rows: 24,
        cwd: process.env.HOME || process.cwd(),
        env: process.env,
      });
    } catch (err) {
      socket.emit("output", `\r\n\x1b[31mCould not start shell: ${err.message}\x1b[0m\r\n`);
      socket.disconnect();
      return;
    }

    // Shell → browser
    ptyProcess.onData((data) => socket.emit("output", data));

    // Browser → shell
    socket.on("input", (data) => ptyProcess.write(data));

    // Match terminal window size (from xterm.js resize events)
    socket.on("resize", ({ cols, rows }) => {
      if (cols && rows) ptyProcess.resize(cols, rows);
    });

    // Shell ended (exit, crash)
    ptyProcess.onExit(({ exitCode }) => {
      socket.emit("output", `\r\n\x1b[33mShell exited (${exitCode}).\x1b[0m\r\n`);
      socket.disconnect();
    });

    // Browser closed tab or lost connection
    socket.on("disconnect", () => {
      ptyProcess.kill();
    });
  });

  return io;
}
