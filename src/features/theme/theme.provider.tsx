import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

const STORAGE_KEY = "explorer-theme";

/**
 * Theme provider for the app. Supports light, dark, and system.
 * Persists choice in localStorage and applies the "dark" class on html for Tailwind.
 */
export function ThemeProvider({
  children,
  ...props
}: React.PropsWithChildren<{
  defaultTheme?: string;
  storageKey?: string;
}>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey={STORAGE_KEY}
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
