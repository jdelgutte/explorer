import {
  useTabsStore,
  type TabNavigationState,
} from "@/features/tabs/store/tabs.store";

/**
 * Facade over the active tab's navigation state in the tabs store.
 * This is not a standalone Zustand store; it reads/writes via useTabsStore.
 */

/** Navigation state shape (for typing). */
export interface NavigationState {
  currentPath: string;
  navigationStack: string[];
  navigationIndex: number;
}

export interface NavigationActions {
  setCurrentPath: (path: string) => void;
  goBack: () => void;
  goForward: () => void;
}

/** Pure logic: compute new navigation state when setting path. */
function setCurrentPathInNav(
  nav: TabNavigationState,
  path: string
): TabNavigationState {
  if (path === "" || path === nav.currentPath) return nav;
  const { navigationStack, navigationIndex } = nav;

  if (
    navigationIndex > 0 &&
    navigationStack[navigationIndex - 1] === path
  ) {
    return {
      currentPath: path,
      navigationStack: nav.navigationStack,
      navigationIndex: navigationIndex - 1,
    };
  }
  if (
    navigationIndex < navigationStack.length - 1 &&
    navigationStack[navigationIndex + 1] === path
  ) {
    return {
      currentPath: path,
      navigationStack: nav.navigationStack,
      navigationIndex: navigationIndex + 1,
    };
  }
  const trimmedStack = navigationStack.slice(0, navigationIndex + 1);
  const newStack =
    trimmedStack[trimmedStack.length - 1] === path
      ? trimmedStack
      : [...trimmedStack, path];
  const newIndex = newStack.length - 1;
  return {
    currentPath: path,
    navigationStack: newStack,
    navigationIndex: newIndex,
  };
}

/** Pure logic: compute new navigation state when going back. */
function goBackInNav(nav: TabNavigationState): TabNavigationState | null {
  if (nav.navigationIndex <= 0) return null;
  const newIndex = nav.navigationIndex - 1;
  return {
    ...nav,
    currentPath: nav.navigationStack[newIndex],
    navigationIndex: newIndex,
  };
}

/** Pure logic: compute new navigation state when going forward. */
function goForwardInNav(nav: TabNavigationState): TabNavigationState | null {
  if (
    nav.navigationIndex < 0 ||
    nav.navigationIndex >= nav.navigationStack.length - 1
  )
    return null;
  const newIndex = nav.navigationIndex + 1;
  return {
    ...nav,
    currentPath: nav.navigationStack[newIndex],
    navigationIndex: newIndex,
  };
}

function setCurrentPath(path: string): void {
  const tabs = useTabsStore.getState();
  const active = tabs.activeTabId;
  if (!active) return;
  const nav = tabs.getNavigationState(active);
  const newNav = setCurrentPathInNav(nav, path);
  tabs.setTabNavigation(active, newNav);
}

function goBack(): void {
  const tabs = useTabsStore.getState();
  const active = tabs.activeTabId;
  if (!active) return;
  const nav = tabs.getNavigationState(active);
  const newNav = goBackInNav(nav);
  if (newNav) tabs.setTabNavigation(active, newNav);
}

function goForward(): void {
  const tabs = useTabsStore.getState();
  const active = tabs.activeTabId;
  if (!active) return;
  const nav = tabs.getNavigationState(active);
  const newNav = goForwardInNav(nav);
  if (newNav) tabs.setTabNavigation(active, newNav);
}

/** Facade over the active tab's navigation state in the tabs store. */
function useNavigationStore(): NavigationState & NavigationActions;
function useNavigationStore<T>(
  selector: (state: NavigationState & NavigationActions) => T
): T;
function useNavigationStore<T>(
  selector?: (state: NavigationState & NavigationActions) => T
): T | (NavigationState & NavigationActions) {
  const nav = useTabsStore((s) => s.getNavigationState(s.activeTabId));
  const state = {
    ...nav,
    setCurrentPath,
    goBack,
    goForward,
  };
  if (selector) return selector(state) as T;
  return state as NavigationState & NavigationActions;
}

useNavigationStore.getState = (): NavigationState => {
  const tabs = useTabsStore.getState();
  return tabs.getNavigationState(tabs.activeTabId);
};

export { useNavigationStore };
