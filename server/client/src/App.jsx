import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Terminal from "./pages/Terminal.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/terminal" element={<Terminal />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
