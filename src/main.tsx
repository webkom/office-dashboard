import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <link rel="icon" type="image/png" href="/favicon.ico" />
    <App />
  </React.StrictMode>,
);
