import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { homeDir } from "@tauri-apps/api/path";
import { Home, HardDrive } from "lucide-react";
import { useNavigationStore } from "@/features/navigation/store/navigation.store";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";

/** Normalize path for comparison (slash style and trailing). */
function normalizePath(p: string): string {
  return p.replace(/\\/g, "/").replace(/\/+$/, "") || "/";
}

/** True if path is the home directory or a descendant of it. */
function isUnderHome(path: string, homePath: string | null): boolean {
  if (!homePath) return true;
  const n = normalizePath(path);
  const h = normalizePath(homePath);
  return n === h /* || n === "/" */ || n.startsWith(h + "/");
}

/** Builds path segments for breadcrumb. When under home, the root icon represents the full home path so we do not show its segments (e.g. home, jdelgutte); we only show segments after it. */
function getPathSegments(
  currentPath: string,
  homePath: string | null
): { path: string; label: string; isRoot: boolean }[] {
  const normalized = normalizePath(currentPath);
  const underHome = isUnderHome(currentPath, homePath);
  const rootPath = underHome && homePath ? normalizePath(homePath) : "/";

  if (normalized === "/" || normalized === "") {
    return [{ path: "/", label: "", isRoot: true }];
  }

  let partsAfterRoot: string[];
  if (underHome && homePath) {
    const prefix = rootPath + "/";
    const after = normalized === rootPath ? "" : (normalized.startsWith(prefix) ? normalized.slice(prefix.length) : normalized);
    partsAfterRoot = after ? after.split("/").filter(Boolean) : [];
  } else {
    partsAfterRoot = normalized.split("/").filter(Boolean);
  }

  const segments: { path: string; label: string; isRoot: boolean }[] = [
    { path: rootPath, label: "", isRoot: true },
  ];
  let acc = rootPath;
  for (const part of partsAfterRoot) {
    acc = acc + (acc.endsWith("/") ? "" : "/") + part;
    segments.push({ path: acc, label: part, isRoot: false });
  }
  return segments;
}

export function ToolbarBreadcrumb() {
  const { t } = useTranslation();
  const currentPath = useNavigationStore((s) => s.currentPath);
  const setCurrentPath = useNavigationStore((s) => s.setCurrentPath);
  const [homePath, setHomePath] = useState<string | null>(null);
  const segments = getPathSegments(currentPath, homePath);

  useEffect(() => {
    homeDir().then(setHomePath).catch(() => setHomePath(null));
  }, []);

  if (segments.length === 0) return null;

  const rootIsHome = isUnderHome(currentPath, homePath);
  const RootIcon = rootIsHome ? Home : HardDrive;
  const rootLabel = rootIsHome ? t("sidebar.home") : segments[0]?.path || "/";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const isRoot = segment.isRoot;
          const label = isRoot ? rootLabel : segment.label;
          const content = isRoot ? (
            <RootIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          ) : (
            label
          );
          return (
            <Fragment key={segment.path}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="flex items-center gap-1.5">
                    {content}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <button
                      type="button"
                      onClick={() => setCurrentPath(segment.path)}
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                      title={label}
                      aria-label={label}
                    >
                      {content}
                    </button>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}