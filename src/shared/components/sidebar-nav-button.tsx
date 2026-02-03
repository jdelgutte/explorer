import { cn } from "@/lib/utils";

type SidebarNavButtonProps = {
  icon: React.ReactNode;
  label: string;
  isSelected: boolean;
  onClick: () => void;
  title?: string;
  className?: string;
  /** Optional suffix (e.g. trash item count or size) shown after the label. */
  suffix?: React.ReactNode;
};

/**
 * Reusable sidebar nav item: icon + label, selected and hover styles.
 */
export function SidebarNavButton({
  icon,
  label,
  isSelected,
  onClick,
  title,
  className,
  suffix,
}: SidebarNavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-9 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition-colors",
        isSelected
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
        className
      )}
      aria-current={isSelected ? "true" : undefined}
      title={title}
    >
      <span className="size-5 shrink-0 [&>svg]:size-5 [&>svg]:text-muted-foreground">
        {icon}
      </span>
      <span className="truncate flex-1 min-w-0">{label}</span>
      {suffix != null && (
        <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
          {suffix}
        </span>
      )}
    </button>
  );
}
