import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ;
const ADMIN_USER = process.env.ADMIN_USER ;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ;

export function login(username, password) {
  if (username !== ADMIN_USER || password !== ADMIN_PASSWORD) {
    return { ok: false, error: "Invalid username or password" };
  }

  const token = jwt.sign({ sub: username }, JWT_SECRET, { expiresIn: "12h" });
  return { ok: true, token };
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
