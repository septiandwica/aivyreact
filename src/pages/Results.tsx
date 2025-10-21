import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import RadarChart from "../components/charts/RadarChart";
import VoiceRadar from "../components/charts/VoiceRadar";
import BarChart from "../components/charts/BarChart";
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { useAuth } from "../components/AuthProvider";

interface AssessmentResult {
  result: any;
  voiceEval?: any;
  behavior?: any;
  points?: number;
  progress?: number;
  createdAt?: any;
}

interface AggregateResult {
  overall_score: number;
  voiceEval: {
    confidence: number;
    positivity: number;
    empathy: number;
  };
  behavior: {
    attention_score: number;
    consistency: number;
    processing_speed: number;
  };
}

export default function Results() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<AssessmentResult[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // === Fetch Data ===
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "assessment_results"),
          where("uid", "==", user.uid),
          orderBy("createdAt", sortOrder),
          limit(10)
        );
        const snap = await getDocs(q);
        const docs: AssessmentResult[] = [];
        snap.forEach((d) => docs.push(d.data() as AssessmentResult));
        setAttempts(docs);
      } catch (err) {
        console.error("Error fetching results:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, sortOrder]);

  // === Loading / Empty States ===
  if (loading)
    return (
      <div style={{ padding: 24 }}>
        <Navbar />
        <p>Loading your assessment results...</p>
      </div>
    );

  if (attempts.length === 0)
    return (
      <div style={{ padding: 24 }}>
        <Navbar />
        <h2>No Results Found</h2>
        <p>
          Complete your first assessment to view personalized insights here.
        </p>
      </div>
    );

  // === Aggregate Helper ===
  const getAggregate = (): AggregateResult => {
    const avg = (arr: number[]) =>
      arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

    return {
      overall_score: avg(attempts.map((a) => a.result?.overall_score || 0)),
      voiceEval: {
        confidence: avg(attempts.map((a) => a.voiceEval?.confidence || 0)),
        positivity: avg(attempts.map((a) => a.voiceEval?.positivity || 0)),
        empathy: avg(attempts.map((a) => a.voiceEval?.empathy || 0)),
      },
      behavior: {
        attention_score: avg(
          attempts.map((a) => a.behavior?.attention_score || 0)
        ),
        consistency: avg(attempts.map((a) => a.behavior?.consistency || 0)),
        processing_speed: avg(
          attempts.map((a) => a.behavior?.processing_speed || 0)
        ),
      },
    };
  };

  // === Determine Selected Data ===
  const isAggregate = selectedIdx === "all";
  const selectedData: AssessmentResult | AggregateResult = isAggregate
    ? getAggregate()
    : attempts[Number(selectedIdx)] || getAggregate();

  const latest = attempts[attempts.length - 1];
  const result = isAggregate
    ? selectedData
    : (selectedData as AssessmentResult).result || {};
  const feedback = result.domain_feedback || {};
  const voice = isAggregate
    ? (selectedData as AggregateResult).voiceEval
    : (selectedData as AssessmentResult).voiceEval || latest.voiceEval || {};
  const behavior = isAggregate
    ? (selectedData as AggregateResult).behavior
    : (selectedData as AssessmentResult).behavior || latest.behavior || {};
  const career = result.career || latest.result?.career || {};

  // === Charts ===
  const radarLabels = [
    "Logic",
    "Creativity",
    "Interpersonal",
    "Practical",
    "Strategy",
  ];
  const radarValues = [
    feedback.logic ? 70 : 60,
    feedback.creativity ? 65 : 60,
    feedback.interpersonal ? 75 : 60,
    feedback.practical ? 65 : 60,
    feedback.strategy ? 70 : 60,
  ];

  const scoreLabels = attempts.map((_, i) => `Attempt #${i + 1}`);
  const scoreValues = attempts.map((a) => a.result?.overall_score || 0);

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const dynamicRadarValues = radarValues.map(
    (v) =>
      (v *
        (behavior.attention_score +
          voice.confidence +
          voice.positivity +
          voice.empathy)) /
      400
  );

  return (
    <div>
      <Navbar />
      <div style={{ padding: 24, maxWidth: 900, margin: "auto" }}>
        <h2 style={title}>AI Competency Assessment Dashboard</h2>
        <p style={subtitle}>
          Welcome back, {user?.displayName || "Student"}. View detailed insights
          from your past assessments and track your progress over time.
        </p>

        {/* === Controls === */}
        <div style={controlsRow}>
          <div>
            <label>
              <b>View attempt:</b>&nbsp;
              <select
                value={selectedIdx}
                onChange={(e) => setSelectedIdx(e.target.value)}
                style={selectBox}
              >
                <option value="all">All Attempts (Average View)</option>
                {attempts.map((a, idx) => (
                  <option key={idx} value={idx}>
                    Attempt #{idx + 1} —{" "}
                    {a.createdAt?.toDate
                      ? a.createdAt.toDate().toLocaleString()
                      : "N/A"}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button onClick={toggleSort} style={sortBtn}>
            {sortOrder === "asc" ? "Oldest → Newest" : "Newest → Oldest"}
          </button>
        </div>

        {/* === Summary Section === */}
        <div style={summaryBox}>
          <div>
            <h4>Overall Score</h4>
            <h2>{result.overall_score ?? 0}</h2>
          </div>
          <div>
            <h4>Total Attempts</h4>
            <h2>{attempts.length}</h2>
          </div>
          <div>
            <h4>Attention</h4>
            <h2>{behavior.attention_score ?? 0}</h2>
          </div>
          <div>
            <h4>Positivity</h4>
            <h2>{voice.positivity ?? 0}</h2>
          </div>
        </div>

        {/* === Charts === */}
        <section style={{ marginTop: 40 }}>
          <h3>Score Progress</h3>
          <BarChart
            labels={scoreLabels}
            values={scoreValues}
            title="Overall Scores per Attempt"
          />
        </section>

        <section style={{ marginTop: 40 }}>
          <h3>Competency Profile</h3>
          <RadarChart
            labels={radarLabels}
            values={dynamicRadarValues}
            title="Domain Feedback Overview"
          />
        </section>

        <section style={{ marginTop: 40 }}>
          <h3>Voice Sentiment</h3>
          <VoiceRadar
            confidence={voice.confidence || 0}
            positivity={voice.positivity || 0}
            empathy={voice.empathy || 0}
          />
        </section>

        <section style={{ marginTop: 40 }}>
          <h3>Behavioral Insights</h3>
          <p>
            <b>Attention:</b> {behavior.attention_score ?? "—"} |{" "}
            <b>Consistency:</b> {behavior.consistency ?? "—"} |{" "}
            <b>Processing Speed:</b> {behavior.processing_speed ?? "—"}
          </p>
        </section>

        {career && (
          <section style={{ marginTop: 40 }}>
            <h3>Career & Major Recommendation</h3>
            <div style={careerBox}>
              <p>
                <b>Recommended Major:</b> {career.major || "-"}
              </p>
              <p>
                <b>Suggested Career:</b> {career.career || "-"}
              </p>
              {career.rationale && (
                <p style={{ fontStyle: "italic" }}>{career.rationale}</p>
              )}
            </div>
          </section>
        )}

        {feedback && (
          <section style={{ marginTop: 40 }}>
            <h3>Detailed Domain Feedback</h3>
            <pre style={feedbackBox}>{JSON.stringify(feedback, null, 2)}</pre>
          </section>
        )}

        <details style={{ marginTop: 24 }}>
          <summary>View Raw JSON Data</summary>
          <pre style={feedbackBox}>{JSON.stringify(selectedData, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
}

/* === Styles === */
const title: React.CSSProperties = {
  fontSize: "1.6rem",
  fontWeight: 600,
  color: "#111827",
  marginBottom: 8,
};

const subtitle: React.CSSProperties = {
  color: "#4B5563",
  fontSize: "1rem",
  marginBottom: 24,
};

const controlsRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 12,
};

const selectBox: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid #d1d5db",
};

const sortBtn: React.CSSProperties = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: 6,
  cursor: "pointer",
};

const summaryBox: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 12,
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: "16px 20px",
  marginTop: 20,
  textAlign: "center",
};

const careerBox: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  background: "#f9fafb",
  padding: 16,
  borderRadius: 8,
  lineHeight: 1.6,
};

const feedbackBox: React.CSSProperties = {
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  padding: 12,
  borderRadius: 8,
  overflow: "auto",
};
