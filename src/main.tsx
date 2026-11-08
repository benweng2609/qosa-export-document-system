import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import "./styles/02.css";
import "./styles/03.css";
import "./styles/04.css";
import "./styles/05.css";
import "./styles/06.css";
import "./styles/07.css";
import App from "./App.tsx";
import { StoreProvider } from "./store.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <App />
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
);
