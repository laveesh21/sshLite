import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, setToken } from "../utils/auth.js";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getToken()) {
      navigate("/terminal", { replace: true });
    }
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Login failed");
        return;
      }

      setToken(data.token);
      navigate("/terminal", { replace: true });
    } catch {
      setError("Could not reach server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h1>sshLite</h1>
      <p className="subtitle">Remote shell for your home PC</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Connecting…" : "Connect"}
        </button>
      </form>
      <p className="error">{error}</p>
    </div>
  );
}
