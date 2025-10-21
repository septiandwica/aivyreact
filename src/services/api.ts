import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// ---------- Types ----------
export type Track = "career" | "academic";

export interface QuestionPayload {
  track: Track;
  count?: number;
  level?: "easy" | "medium" | "hard";
}

export interface AnswerPayload {
  track: Track;
  answers: { id: string; answer: string }[];
}

//not yet implement
export interface AdaptivePayload {
  track: Track;
  last_score: number;
  last_level: "easy" | "medium" | "hard";
}

export interface ProfilePayload {
  logic: number;
  creativity: number;
  interpersonal: number;
  practical: number;
  strategy: number;
}

export interface BehaviorPayload {
  response_times: number[];
  consistency_score: number;
  interruptions?: number;
}

export interface VoicePayload {
  transcript: string;
}

// ---------- API Calls ----------
export const generateQuestions = (payload: QuestionPayload) =>
  api.post("/generate", payload);

export const scoreAnswers = (payload: AnswerPayload) =>
  api.post("/score", payload);

//not yet implement
export const nextAdaptive = (payload: AdaptivePayload) =>
  api.post("/adaptive/next", payload);

export const analyzeBehavior = (payload: BehaviorPayload) =>
  api.post("/behavior/analyze", payload);

export const matchCareer = (payload: ProfilePayload) =>
  api.post("/career/match", payload);

export const evaluateVoice = (payload: VoicePayload) =>
  api.post("/voice/evaluate", payload);

