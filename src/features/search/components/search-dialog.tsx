"use client";

import { useDebounce } from "ahooks";
import { FileIcon, FolderIcon, Loader2, Search } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useThrottleFn } from "ahooks";
import { openPath } from "@tauri-apps/plugin-opener";
import { useNavigationStore } from "@/features/navigation/store/navigation.store";
import type { SearchResult } from "@/features/search/search.api";
import { searchApi } from "@/features/search/search.api";
import { useSearchStore } from "@/features/search/store/search.store";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

const SEARCH_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 3;
const RESULTS_THROTTLE_MS = 150;

export function SearchDialog() {
  const { t } = useTranslation();
  const setCurrentPath = useNavigationStore((s) => s.setCurrentPath);
  const {
    searchDialogOpen: isOpen,
    setSearchDialogOpen,
    query,
    queryResults,
    isLoading,
    currentSearchId,
    setQuery,
    startSearch,
    clearResults,
  } = useSearchStore();

  const debouncedQuery = useDebounce(query.trim(), { wait: SEARCH_DEBOUNCE_MS });

  const pendingResultsRef = useRef<{ searchId: string; results: SearchResult[] }[]>([]);
  const { run: flushResultsToStore, flush: flushResultsImmediate } = useThrottleFn(() => {
    const pending = pendingResultsRef.current.splice(0, pendingResultsRef.current.length);
    if (pending.length === 0) return;
    const byId = new Map<string, SearchResult[]>();
    for (const { searchId, results } of pending) {
      const arr = byId.get(searchId) ?? [];
      arr.push(...results);
      byId.set(searchId, arr);
    }
    for (const [searchId, results] of byId) {
      useSearchStore.getState().appendResults(searchId, results);
    }
  }, { wait: RESULTS_THROTTLE_MS });

  const onOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        if (currentSearchId) {
          searchApi.cancelSearch(currentSearchId).catch(() => {});
        }
        clearResults();
      }
      setSearchDialogOpen(next);
    },
    [setSearchDialogOpen, clearResults, currentSearchId]
  );

  // Register search event listeners once; throttle UI updates to avoid bombarding the UI
  useEffect(() => {
    let unlistenResults: (() => void) | undefined;
    let unlistenDone: (() => void) | undefined;

    (async () => {
      unlistenResults = await searchApi.listenSearchResults((payload) => {
        pendingResultsRef.current.push({
          searchId: payload.search_id,
          results: payload.results,
        });
        flushResultsToStore();
      });
      unlistenDone = await searchApi.listenSearchDone((payload) => {
        flushResultsImmediate();
        useSearchStore.getState().setSearchDone(payload.search_id);
      });
    })();

    return () => {
      unlistenResults?.();
      unlistenDone?.();
    };
  }, [flushResultsToStore, flushResultsImmediate]);

  // Run global search when debounced query has enough characters
  useEffect(() => {
    if (!isOpen || debouncedQuery.length < MIN_QUERY_LENGTH) return;
    startSearch(debouncedQuery);
  }, [isOpen, debouncedQuery, startSearch]);

  const handleResultDoubleClick = useCallback(
    async (result: SearchResult) => {
      if (result.is_directory) {
        setCurrentPath(result.path);
        onOpenChange(false);
      } else {
        await openPath(result.path);
        onOpenChange(false);
      }
    },
    [setCurrentPath, onOpenChange]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
        showCloseButton={true}
      >
        <DialogHeader className="shrink-0 border-b px-4 py-3">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Search className="size-4" />
            {t("search.title")}
          </DialogTitle>
          <DialogDescription>
            {t("search.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex shrink-0 flex-col gap-2 px-4 py-2">
          <label htmlFor="search-query" className="text-xs font-medium text-muted-foreground">
            {t("search.queryLabel")}
          </label>
          <input
            id="search-query"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholder", { count: MIN_QUERY_LENGTH })}
            className="h-9 w-full rounded-md border border-input bg-muted/50 px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
        </div>

        <div className="min-h-0 flex-1 overflow-hidden border-t">
          {query.trim() === "" && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t("search.hintEmpty", { count: MIN_QUERY_LENGTH })}
            </div>
          )}
          {query.trim() !== "" && query.trim().length < MIN_QUERY_LENGTH && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t("search.hintMinChars", { count: MIN_QUERY_LENGTH })}
            </div>
          )}
          {query.trim().length >= MIN_QUERY_LENGTH && isLoading && queryResults.length === 0 && (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">{t("search.searching")}</span>
            </div>
          )}
          {query.trim().length >= MIN_QUERY_LENGTH && !isLoading && debouncedQuery.length >= MIN_QUERY_LENGTH && queryResults.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t("search.noResults")}
            </div>
          )}
          {(isLoading || queryResults.length > 0) && queryResults.length > 0 && (
            <>
              <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-muted/40 px-4 py-1.5 text-xs text-muted-foreground">
                <span>
                  {t("search.resultCount", { count: queryResults.length })}
                  {isLoading && ` ${t("search.updating")}`}
                </span>
              </div>
              <div className="max-h-[40vh] overflow-y-auto py-1">
                {queryResults.map((result, index) => (
                  <SearchResultRow
                    key={`${result.path}-${index}`}
                    result={result}
                    onDoubleClick={() => handleResultDoubleClick(result)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SearchResultRow({
  result,
  onDoubleClick,
}: {
  result: SearchResult;
  onDoubleClick: () => void;
}) {
  return (
    <button
      type="button"
      onDoubleClick={onDoubleClick}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-2 text-left outline-none transition-colors",
        "hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      {result.is_directory ? (
        <FolderIcon className="size-5 shrink-0 text-muted-foreground" />
      ) : (
        <FileIcon className="size-5 shrink-0 text-muted-foreground" />
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-foreground">{result.name}</div>
        <div className="truncate text-xs text-muted-foreground" title={result.path}>
          {result.path}
        </div>
      </div>
    </button>
  );
}
