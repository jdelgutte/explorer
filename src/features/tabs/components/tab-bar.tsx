import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useTabsStore } from "@/features/tabs/store/tabs.store";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";

export function TabBar() {
  const { t } = useTranslation();
  const tabs = useTabsStore((s) => s.tabs);
  const activeTabId = useTabsStore((s) => s.activeTabId);
  const selectedTabIds = useTabsStore((s) => s.selectedTabIds);
  const setActiveTab = useTabsStore((s) => s.setActiveTab);
  const closeTab = useTabsStore((s) => s.closeTab);
  const closeSelectedTabs = useTabsStore((s) => s.closeSelectedTabs);
  const selectTab = useTabsStore((s) => s.selectTab);
  const clearTabSelection = useTabsStore((s) => s.clearTabSelection);
  const renameTab = useTabsStore((s) => s.renameTab);
  const addTab = useTabsStore((s) => s.addTab);

  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus inline input when entering rename mode
  useEffect(() => {
    if (editingTabId) {
      setEditingLabel(tabs.find((t) => t.id === editingTabId)?.label ?? "");
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editingTabId, tabs]);

  const handleCommitRename = useCallback(() => {
    if (editingTabId) {
      renameTab(editingTabId, editingLabel.trim() || t("tabs.defaultLabel"));
      setEditingTabId(null);
    }
  }, [editingTabId, editingLabel, renameTab, t]);

  const handleTabClick = useCallback(
    (tabId: string, e: React.MouseEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        selectTab(tabId, true);
      } else {
        clearTabSelection();
        setActiveTab(tabId);
      }
    },
    [selectTab, clearTabSelection, setActiveTab],
  );

  const handleCloseClick = useCallback(
    (e: React.MouseEvent, tabId: string) => {
      e.stopPropagation();
      const multi = selectedTabIds.length > 1 && selectedTabIds.includes(tabId);
      if (multi) closeSelectedTabs();
      else closeTab(tabId);
    },
    [selectedTabIds, closeSelectedTabs, closeTab],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editingTabId) {
          setEditingTabId(null);
          e.preventDefault();
        } else {
          clearTabSelection();
        }
      }
    },
    [editingTabId, clearTabSelection],
  );

  if (tabs.length === 0) return null;

  return (
    <div
      className="flex min-w-0 shrink-0 items-stretch gap-0"
      onKeyDown={handleKeyDown}
      role="tablist"
      aria-label={t("tabs.ariaLabel")}
    >
      <Tabs
        value={activeTabId ?? ""}
        onValueChange={(id) => {
          clearTabSelection();
          setActiveTab(id);
        }}
        className="min-w-0 flex-1"
      >
        <TabsList className="relative h-auto w-full justify-start gap-0.5 bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border">
          {tabs.map((tab) => {
            const isSelected = selectedTabIds.includes(tab.id);
            const isEditing = editingTabId === tab.id;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                onClick={(e) => handleTabClick(tab.id, e)}
                className={cn(
                  "group flex min-w-0 flex-1 items-center justify-between gap-1.5 overflow-hidden rounded-b-none border-x border-t bg-muted px-3 py-2 text-sm font-medium data-[state=active]:z-10 data-[state=active]:bg-background data-[state=active]:shadow-none",
                  isSelected && "ring-2 ring-ring ring-offset-1 ring-offset-background",
                )}
              >
                {isEditing ? (
                  <input
                    ref={inputRef}
                    type="text"
                    className="min-w-0 flex-1 truncate border-none bg-transparent px-0 py-0 text-sm outline-none focus:ring-0"
                    value={editingLabel}
                    onChange={(e) => setEditingLabel(e.target.value)}
                    onBlur={handleCommitRename}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCommitRename();
                      if (e.key === "Escape") setEditingTabId(null);
                      e.stopPropagation();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={t("tabs.renameTab")}
                  />
                ) : (
                  <span
                    className="truncate"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingTabId(tab.id);
                    }}
                    title={t("tabs.doubleClickToRename")}
                  >
                    {tab.label}
                  </span>
                )}
                <button
                  type="button"
                  aria-label={t("tabs.closeTab", { label: tab.label })}
                  className="ml-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm opacity-60 hover:opacity-100 hover:bg-muted-foreground/15 focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-ring/50"
                  onClick={(e) => handleCloseClick(e, tab.id)}
                >
                  <X className="size-3.5" />
                </button>
              </TabsTrigger>
            );
          })}
          <Button
            type="button"
            aria-label={t("tabs.newTab")}
            onClick={addTab}
            className="size-8 shrink-0 rounded-b-none border-x border-t border-border bg-muted text-muted-foreground transition-colors hover:bg-muted-foreground/10 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:ring-inset"
          >
            <Plus className="size-4" />
          </Button>
        </TabsList>
      </Tabs>
    </div>
  );
}
