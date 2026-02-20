/* global Office */

import * as React from "react";
import { createRoot } from "react-dom/client";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import App from "./components/App";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);

Office.onReady(() => {
  root.render(
    <FluentProvider theme={webLightTheme}>
      <App title="Nightshift" />
    </FluentProvider>
  );
});
