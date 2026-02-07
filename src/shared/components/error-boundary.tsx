import { Component, type ErrorInfo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

/**
 * Catches React errors in the tree and displays a fallback UI instead of a blank screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      return <ErrorFallback error={this.state.error} onRetry={() => this.setState({ hasError: false, error: null })} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center" role="alert">
      <AlertTriangle className="size-12 text-destructive" aria-hidden />
      <h2 className="text-lg font-semibold">{t("errorBoundary.title")}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{t("errorBoundary.description")}</p>
      <p className="max-w-md truncate text-xs text-muted-foreground" title={error.message}>
        {error.message}
      </p>
      <Button variant="outline" onClick={onRetry}>
        {t("errorBoundary.retry")}
      </Button>
    </div>
  );
}
