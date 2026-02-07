import React from "react";
import ReactDOM from "react-dom/client";
import "@/i18n/i18n";
import { I18nProvider } from "@/i18n/I18nProvider";
import { ThemeProvider } from "@/features/theme/theme.provider";
import { ErrorBoundary } from "@/shared/components/error-boundary";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </I18nProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
