import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

type OptionSectionHeaderProps = {
  /** Translated section title. */
  title: string;
  /** Translated tooltip/description (for aria-label and tooltip content). */
  tooltip: string;
};

/**
 * Section header with optional help icon and tooltip. Used across options tabs.
 */
export function OptionSectionHeader({ title, tooltip }: OptionSectionHeaderProps) {
  return (
    <div className="flex items-center gap-1.5">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={tooltip}
          >
            <HelpCircle className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
