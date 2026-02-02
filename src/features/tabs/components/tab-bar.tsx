import { Plus, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useTabsStore } from "@/features/tabs/store/tabs.store";

export function TabBar() {
  const tabs = useTabsStore((s) => s.tabs);
  const activeTabId = useTabsStore((s) => s.activeTabId);
  const setActiveTab = useTabsStore((s) => s.setActiveTab);
  const closeTab = useTabsStore((s) => s.closeTab);
  const addTab = useTabsStore((s) => s.addTab);

  if (tabs.length === 0) return null;

  return (
    <div className="flex min-w-0 shrink-0 items-stretch gap-0">
      <Tabs
        value={activeTabId ?? ""}
        onValueChange={(id) => setActiveTab(id)}
        className="min-w-0 flex-1"
      >
        <TabsList className="relative h-auto w-full justify-start gap-0.5 bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="group flex min-w-0 max-w-40 items-center justify-between gap-1.5 overflow-hidden rounded-b-none border-x border-t bg-muted px-3 py-2 text-sm font-medium data-[state=active]:z-10 data-[state=active]:bg-background data-[state=active]:shadow-none"
            >
              <span className="truncate">{tab.label}</span>
              <button
                type="button"
                aria-label={`Close ${tab.label}`}
                className="ml-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm opacity-60 hover:opacity-100 hover:bg-muted-foreground/15 focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-ring/50"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                <X className="size-3.5" />
              </button>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="flex items-center border-x border-t border-border bg-muted px-1 py-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
          onClick={addTab}
          aria-label="New tab"
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}
