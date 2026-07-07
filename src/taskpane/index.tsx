/* global Office */

import * as React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-sans/700.css";
import "./global.css";
import App from "./components/App";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);

Office.onReady(() => {
  root.render(<App />);
});
