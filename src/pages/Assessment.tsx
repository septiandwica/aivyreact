import { useState } from "react";
import Navbar from "../components/Navbar";
import {
  generateQuestions,
  scoreAnswers,
  analyzeBehavior,
  evaluateVoice,
  matchCareer,
} from "../services/api";
import useSpeechToText from "../hooks/useSpeechToText";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../services/firebase";

export default function Assessment() {
  const [step, setStep] = useState(0);
  const [track, setTrack] = useState<"career" | "academic">("career");
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<any>(null);
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [behavior, setBehavior] = useState<any>(null);
  const [voiceEval, setVoiceEval] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [useManualInput, setUseManualInput] = useState(false);

  const { text, listening, start, stop, supported, error, setManualText } =
    useSpeechToText();

  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [lastStart, setLastStart] = useState<number>(0);
  const startTimer = () => setLastStart(Date.now());
  const stopTimer = () => {
    if (lastStart) {
      const diff = (Date.now() - lastStart) / 1000;
      setResponseTimes((prev) => [...prev, diff]);
      setLastStart(0);
    }
  };

  // === STEP 1: Generate Questions ===
  const handleStartAssessment = async () => {
    setLoading(true);
    setAnswers({});
    setResponseTimes([]);
    try {
      const res = await generateQuestions({ track, count: 15 });
      setQuestions(res.data.items);
      setStep(1);
      startTimer();
    } finally {
      setLoading(false);
    }
  };

  // === STEP 2: Submit Answers ===
  const handleSubmitAnswers = async () => {
    setLoading(true);
    stopTimer();
    try {
      const scored = await scoreAnswers({
        track,
        answers: Object.entries(answers).map(([id, answer]) => ({
          id,
          answer,
        })),
      });
      setResults(scored.data);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  // === STEP 3: Voice Evaluation ===
  const handleVoiceEval = async () => {
    const transcript = text?.trim();
    if (!transcript) {
      alert("Please provide your voice or typed reflection before continuing.");
      return;
    }
    setLoading(true);
    try {
      const res = await evaluateVoice({ transcript });
      setVoiceEval(res.data);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  // === STEP 4: Behavior Analysis + Career Match + Save Firestore ===
  const handleBehaviorAnalysis = async () => {
    setLoading(true);
    try {
      const behaviorRes = await analyzeBehavior({
        response_times: responseTimes.slice(0, questions.length),
        consistency_score: 80,
        interruptions: 0,
      });
      setBehavior(behaviorRes.data);

      const profile = {
        logic: 80,
        creativity: 70,
        interpersonal: 75,
        practical: 65,
        strategy: 70,
      };

      const careerRes = await matchCareer(profile);
      const finalResults = { ...results, career: careerRes.data };
      setResults(finalResults);
      setStep(4);

      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "assessment_results"), {
          uid: user.uid,
          topic: track,
          result: finalResults,
          voiceEval,
          behavior: behaviorRes.data,
          createdAt: serverTimestamp(),
        });
        alert("Your assessment has been saved successfully.");
      }
    } catch (err) {
      console.error("Error while saving:", err);
    } finally {
      setLoading(false);
    }
  };

  // === Render Steps ===
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div style={section}>
            <h2 style={title}>AI-Based Competency Assessment</h2>
            <p style={desc}>
              This assessment helps you evaluate your career or academic
              readiness using AI-driven analytics.
            </p>
            <label>
              <b>Select Track:</b>&nbsp;
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value as any)}
                style={selectBox}
              >
                <option value="career">Career Readiness</option>
                <option value="academic">Academic Readiness</option>
              </select>
            </label>
            <button
              onClick={handleStartAssessment}
              disabled={loading}
              style={btnPrimary}
            >
              Start Assessment
            </button>
          </div>
        );

      case 1:
        return (
          <div style={section}>
            <h3 style={stepTitle}>
              Step 1 — Answer {questions.length} Questions
            </h3>
            {questions.map((q, idx) => (
              <div key={q.id} style={questionBox}>
                <h4>
                  {idx + 1}. [{q.level.toUpperCase()}] {q.question}
                </h4>
                {q.options.map((opt: any) => (
                  <label key={opt.key} style={{ display: "block" }}>
                    <input
                      type="radio"
                      name={q.id}
                      value={opt.key}
                      checked={answers[q.id] === opt.key}
                      onChange={(e) => {
                        stopTimer();
                        setAnswers({ ...answers, [q.id]: e.target.value });
                        startTimer();
                      }}
                    />{" "}
                    {opt.key}. {opt.text}
                  </label>
                ))}
              </div>
            ))}
            <button onClick={handleSubmitAnswers} style={btnPrimary}>
              Submit Answers
            </button>
          </div>
        );

      case 2:
        return (
          <div style={section}>
            <h3 style={stepTitle}>Step 2 — Voice Reflection</h3>
            <p style={desc}>
              Please reflect verbally or type your response below.
            </p>

            {!supported || useManualInput ? (
              <>
                <textarea
                  placeholder="Type your reflection here..."
                  value={text}
                  onChange={(e) => setManualText(e.target.value)}
                  style={textArea}
                />
                {error && (
                  <p style={{ color: "red" }}>
                    Speech recognition is not supported or failed.
                  </p>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={listening ? stop : start}
                  style={btnPrimary}
                  disabled={loading}
                >
                  {listening ? "Stop Recording" : "Start Recording"}
                </button>
                <p>
                  <b>Transcript:</b> {text || "Listening..."}
                </p>
                {error && (
                  <p style={{ color: "red" }}>
                    {error}.{" "}
                    <button
                      onClick={() => setUseManualInput(true)}
                      style={btnInline}
                    >
                      Switch to manual input
                    </button>
                  </p>
                )}
              </>
            )}

            <button
              onClick={handleVoiceEval}
              disabled={!text}
              style={btnPrimary}
            >
              Analyze Voice
            </button>
          </div>
        );

      case 3:
        return (
          <div style={section}>
            <h3 style={stepTitle}>Step 3 — Behavioral Analysis</h3>
            <p style={desc}>
              The system analyzes your response timing, focus, and consistency
              to evaluate behavioral patterns.
            </p>
            <button
              onClick={handleBehaviorAnalysis}
              style={btnPrimary}
              disabled={loading}
            >
              Generate Report
            </button>
          </div>
        );

      case 4:
        return (
          <div style={section}>
            <h3 style={stepTitle}>Final Report</h3>
            <p style={desc}>Below is your AI-generated assessment summary.</p>
            <pre style={preBox}>{JSON.stringify(results, null, 2)}</pre>
          </div>
        );
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: 24, maxWidth: 800, margin: "auto" }}>
        {renderStep()}
      </div>
    </div>
  );
}

// === Styles ===
const title: React.CSSProperties = {
  fontSize: "1.8rem",
  fontWeight: 600,
  marginBottom: 8,
};

const desc: React.CSSProperties = {
  color: "#4B5563",
  lineHeight: 1.6,
  marginBottom: 12,
};

const stepTitle: React.CSSProperties = {
  fontSize: "1.3rem",
  fontWeight: 500,
  marginBottom: 8,
  color: "#1F2937",
};

const section: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  marginTop: 20,
};

const questionBox: React.CSSProperties = {
  background: "#F9FAFB",
  border: "1px solid #E5E7EB",
  borderRadius: 8,
  padding: "12px 16px",
};

const btnPrimary: React.CSSProperties = {
  background: "#2563EB",
  color: "white",
  padding: "10px 16px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  width: "fit-content",
};

const btnInline: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#2563EB",
  cursor: "pointer",
  textDecoration: "underline",
};

const textArea: React.CSSProperties = {
  width: "100%",
  height: 120,
  padding: 10,
  borderRadius: 6,
  border: "1px solid #D1D5DB",
  resize: "vertical",
};

const selectBox: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #D1D5DB",
  background: "white",
  fontSize: "0.95rem",
};

const preBox: React.CSSProperties = {
  background: "#F9FAFB",
  padding: 12,
  border: "1px solid #E5E7EB",
  overflow: "auto",
  borderRadius: 8,
  fontSize: "0.9rem",
  lineHeight: 1.5,
};
