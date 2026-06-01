const token = sessionStorage.getItem("sshlite_token");
if (!token) {
  window.location.href = "/";
}

const term = new Terminal({
  cursorBlink: true,
  theme: { background: "#0d1117", foreground: "#e6edf3" },
});
const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);
term.open(document.getElementById("terminal"));
fitAddon.fit();

const socket = io({
  auth: { token },
});

socket.on("connect_error", () => {
  term.writeln("\r\n\x1b[31mConnection failed. Log in again.\x1b[0m");
  setTimeout(() => {
    sessionStorage.removeItem("sshlite_token");
    window.location.href = "/";
  }, 2000);
});

socket.on("output", (data) => term.write(data));

term.onData((data) => socket.emit("input", data));

window.addEventListener("resize", () => {
  fitAddon.fit();
  socket.emit("resize", { cols: term.cols, rows: term.rows });
});

socket.on("connect", () => {
  fitAddon.fit();
  socket.emit("resize", { cols: term.cols, rows: term.rows });
  term.focus();
});

socket.on("disconnect", () => {
  term.writeln("\r\n\x1b[33mDisconnected from server.\x1b[0m");
});
