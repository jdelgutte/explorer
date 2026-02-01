import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { ButtonGroup } from "@/shared/components/ui/button-group";
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
    <ButtonGroup className="rounded-lg border border-border/60 bg-muted/30">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={goBack}
        disabled={!canGoBack}
        aria-label="Back"
      >
        <ChevronLeft className="size-4" />
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
        <ChevronRight className="size-4" />
      </Button>
    </ButtonGroup>
  );
}
