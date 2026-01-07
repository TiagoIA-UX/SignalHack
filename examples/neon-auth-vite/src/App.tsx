import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/home";
import Auth from "./pages/auth";
import Account from "./pages/account";

export default function App() {
  return (
    <div className="app" style={{ padding: 20, fontFamily: "Inter, system-ui, sans-serif" }}>
      <nav style={{ marginBottom: 20 }}>
        <Link to="/" style={{ marginRight: 10 }}>
          Home
        </Link>
        <Link to="/auth" style={{ marginRight: 10 }}>
          Auth
        </Link>
        <Link to="/account">Account</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </div>
  );
}
