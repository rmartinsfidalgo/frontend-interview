import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Theme } from "@components";
import { Notifications } from "./notifications";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Theme>
      <Notifications />
    </Theme>
  </StrictMode>,
);
