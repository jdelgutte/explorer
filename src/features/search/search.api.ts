import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

/** Event name for a batch of search results. */
export const SEARCH_RESULTS = "search-results";
/** Event name when search is finished. */
export const SEARCH_DONE = "search-done";

/** One search result (file or directory). */
export type SearchResult = {
  name: string;
  path: string;
  is_directory: boolean;
};

/** Payload for search-results event. */
export type SearchResultsPayload = {
  search_id: string;
  results: SearchResult[];
};

/** Payload for search-done event. */
export type SearchDonePayload = {
  search_id: string;
};

/** Starts a global search (from home if rootPath omitted); results are emitted via events in batches. Pass searchId so the frontend can set currentSearchId before any event arrives. */
export const searchApi = {
  startSearch: (query: string, searchId: string): Promise<string> =>
    invoke<string>("start_search", { query, search_id: searchId }),

  /** Cancels an ongoing search. No-op if the search is already finished or unknown. */
  cancelSearch: (searchId: string): Promise<void> =>
    invoke("cancel_search", { searchId }),

  /**
   * Listens for search result batches.
   * @returns Promise that resolves to an unlisten function.
   */
  listenSearchResults: (
    onResults: (payload: SearchResultsPayload) => void
  ): Promise<() => void> =>
    listen<SearchResultsPayload>(SEARCH_RESULTS, (event) =>
      onResults(event.payload)
    ),

  /**
   * Listens for search completion.
   * @returns Promise that resolves to an unlisten function.
   */
  listenSearchDone: (
    onDone: (payload: SearchDonePayload) => void
  ): Promise<() => void> =>
    listen<SearchDonePayload>(SEARCH_DONE, (event) => onDone(event.payload)),
};
