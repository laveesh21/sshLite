import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { io } from "socket.io-client";
import { clearToken, getToken } from "../utils/auth.js";
import "@xterm/xterm/css/xterm.css";

export default function Terminal() {
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    const term = new XTerm({
      cursorBlink: true,
      theme: { background: "#0d1117", foreground: "#e6edf3" },
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();

    const socket = io({ auth: { token } });

    socket.on("connect_error", () => {
      term.writeln("\r\n\x1b[31mConnection failed. Log in again.\x1b[0m");
      setTimeout(() => {
        clearToken();
        navigate("/", { replace: true });
      }, 2000);
    });

    socket.on("output", (data) => term.write(data));
    term.onData((data) => socket.emit("input", data));

    const onResize = () => {
      fitAddon.fit();
      socket.emit("resize", { cols: term.cols, rows: term.rows });
    };

    window.addEventListener("resize", onResize);

    socket.on("connect", () => {
      fitAddon.fit();
      socket.emit("resize", { cols: term.cols, rows: term.rows });
      term.focus();
    });

    socket.on("disconnect", () => {
      term.writeln("\r\n\x1b[33mDisconnected from server.\x1b[0m");
    });

    return () => {
      window.removeEventListener("resize", onResize);
      socket.disconnect();
      term.dispose();
    };
  }, [navigate]);

  function logout() {
    clearToken();
    navigate("/", { replace: true });
  }

  return (
    <>
      <header className="terminal-header">
        <span>sshLite terminal</span>
        <button type="button" className="logout-link" onClick={logout}>
          Logout
        </button>
      </header>
      <div className="terminal-container" ref={containerRef} />
    </>
  );
}
