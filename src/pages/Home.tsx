import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <div style={container}>
        <h2 style={title}>
          Welcome to the AI-Based Competency Assessment System
        </h2>
        <p style={text}>
          This platform helps you evaluate your <b>career</b> and{" "}
          <b>academic readiness</b>
          through AI-powered adaptive assessments and personalized insights.
        </p>
        <p style={text}>
          Select <b>Assessment</b> from the navigation menu to begin. Once
          completed, your detailed results will appear in the{" "}
          <b>Results Dashboard</b>.
        </p>
      </div>
    </div>
  );
}

const container: React.CSSProperties = {
  padding: "48px 24px",
  maxWidth: "800px",
  margin: "auto",
  textAlign: "center",
};

const title: React.CSSProperties = {
  fontSize: "1.8rem",
  fontWeight: 600,
  marginBottom: 16,
  color: "#111827",
};

const text: React.CSSProperties = {
  fontSize: "1.05rem",
  lineHeight: 1.6,
  color: "#374151",
  marginBottom: 12,
};
