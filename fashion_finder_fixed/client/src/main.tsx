import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import { QuizProvider } from "./context/QuizContext.jsx";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <QuizProvider>
      <App />
    </QuizProvider>
  </AuthProvider>
);
