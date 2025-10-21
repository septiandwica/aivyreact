import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function Navbar() {
  const { logout } = useAuth();

  return (
    <nav style={navbar}>
      <div style={leftGroup}>
        <h2 style={brand}>AI Competency System</h2>
        <Link to="/" style={link}>
          Home
        </Link>
        <Link to="/assessment" style={link}>
          Assessment
        </Link>
        <Link to="/results" style={link}>
          Results
        </Link>
      </div>
      <button onClick={logout} style={logoutBtn}>
        Logout
      </button>
    </nav>
  );
}

/* === Styles === */
const navbar: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 24px",
  borderBottom: "1px solid #E5E7EB",
  background: "#F9FAFB",
  position: "sticky",
  top: 0,
  zIndex: 10,
};

const leftGroup: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 20,
};

const brand: React.CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 600,
  color: "#1F2937",
  marginRight: 12,
};

const link: React.CSSProperties = {
  textDecoration: "none",
  color: "#374151",
  fontSize: "0.95rem",
  fontWeight: 500,
  transition: "color 0.2s ease",
};

const logoutBtn: React.CSSProperties = {
  background: "#2563EB",
  color: "white",
  border: "none",
  borderRadius: 6,
  padding: "6px 12px",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: 500,
  transition: "background 0.2s ease",
};
