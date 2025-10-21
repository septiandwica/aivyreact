import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";

export default function Login() {
  const { user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={title}>AI-Based Competency Assessment</h1>
        <p style={subtitle}>
          Sign in with your institutional account to begin the assessment.
        </p>
        <button onClick={loginWithGoogle} style={btnPrimary}>
          Continue with Google
        </button>
      </div>
    </div>
  );
}

/* === Styles === */
const container: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
  padding: 20,
};

const card: React.CSSProperties = {
  background: "white",
  padding: "40px 32px",
  borderRadius: 12,
  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  textAlign: "center",
  maxWidth: 400,
  width: "100%",
  border: "1px solid #E5E7EB",
};

const title: React.CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 600,
  color: "#1F2937",
  marginBottom: 8,
};

const subtitle: React.CSSProperties = {
  color: "#4B5563",
  marginBottom: 24,
  fontSize: "0.95rem",
  lineHeight: 1.5,
};

const btnPrimary: React.CSSProperties = {
  background: "#2563EB",
  color: "white",
  border: "none",
  borderRadius: 6,
  padding: "10px 16px",
  fontSize: "1rem",
  cursor: "pointer",
  fontWeight: 500,
  transition: "background 0.2s ease",
};
