import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#0f172a", // 다크 네이비
            color: "#ffffff",
            fontWeight: 600,
            borderRadius: "12px",
            padding: "12px 16px",
          },
          success: {
            style: {
              background: "#33a75d", // 초록
            },
          },
          error: {
            style: {
              background: "#de4e4e", // 빨강
            },
          },
        }}
      />
    </AuthProvider>
  </StrictMode>
);
