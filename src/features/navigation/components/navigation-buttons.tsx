import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useFileStore } from "@/features/file/store/file.store";

export function NavigationButtons() {
  const navigationIndex = useFileStore((s) => s.navigationIndex);
  const navigationStack = useFileStore((s) => s.navigationStack);
  const goBack = useFileStore((s) => s.goBack);
  const goForward = useFileStore((s) => s.goForward);

  const canGoBack = navigationIndex > 0;
  const canGoForward =
    navigationStack.length > 0 &&
    navigationIndex >= 0 &&
    navigationIndex < navigationStack.length - 1;

  return (
    <div className="flex items-center gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={goBack}
        disabled={!canGoBack}
        aria-label="Back"
      >
        <ChevronLeft className="size-5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={goForward}
        disabled={!canGoForward}
        aria-label="Forward"
      >
        <ChevronRight className="size-5" />
      </Button>
    </div>
  );
}
