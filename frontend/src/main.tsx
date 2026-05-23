import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Dashboard />
    <Toaster
      position="bottom-right"
      gutter={8}
      toastOptions={{
        duration: 3000,
        style: {
          background: "#18181f",
          color: "#f0f0f5",
          border: "1px solid #2a2a35",
          borderRadius: "10px",
          fontSize: "13px",
          fontFamily: "Inter, sans-serif",
          letterSpacing: "-0.01em",
          padding: "10px 14px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        },
        success: { iconTheme: { primary: "#22c55e", secondary: "#18181f" } },
        error:   { iconTheme: { primary: "#ef4444", secondary: "#18181f" } },
      }}
    />
  </StrictMode>
);
