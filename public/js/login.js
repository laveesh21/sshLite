const form = document.getElementById("login-form");
const errorEl = document.getElementById("error");
const submitBtn = form.querySelector("button[type=submit]");

if (sessionStorage.getItem("sshlite_token")) {
  window.location.href = "/terminal.html";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.textContent = "";
  submitBtn.disabled = true;
  submitBtn.textContent = "Connecting…";

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      errorEl.textContent = data.error || "Login failed";
      return;
    }

    sessionStorage.setItem("sshlite_token", data.token);
    window.location.href = "/terminal.html";
  } catch {
    errorEl.textContent = "Could not reach server";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Connect";
  }
});
