import { Suspense } from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./components/AuthProvider";

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
        <AppRoutes />
      </Suspense>
    </AuthProvider>
  );
}
