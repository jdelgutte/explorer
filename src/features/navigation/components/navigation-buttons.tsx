import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/button";
import { ButtonGroup } from "@/shared/components/ui/button-group";
import { useNavigationStore } from "@/features/navigation/store/navigation.store";

export function NavigationButtons() {
  const { t } = useTranslation();
  const navigationIndex = useNavigationStore((s) => s.navigationIndex);
  const navigationStack = useNavigationStore((s) => s.navigationStack);
  const goBack = useNavigationStore((s) => s.goBack);
  const goForward = useNavigationStore((s) => s.goForward);

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
        aria-label={t("nav.back")}
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
        aria-label={t("nav.forward")}
      >
        <ChevronRight className="size-4" />
      </Button>
    </ButtonGroup>
  );
}
