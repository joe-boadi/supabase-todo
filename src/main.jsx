import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={new QueryClient()}>
    <StrictMode>
      <App />
    </StrictMode>
  </QueryClientProvider>
);
