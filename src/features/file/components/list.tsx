import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { EmptyFile } from "./empty-file";
import { EntryIcon } from "./entry-icon";
import type { FileViewChildProps } from "./file-view";

export function FileList({
  entries,
  isEntrySelected,
  onSelect,
  onDoubleClick: handleDoubleClick,
}: FileViewChildProps) {
  if (entries.length === 0) {
    return <EmptyFile />;
  }

  return (
    <div className="flex-1 overflow-auto h-full">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10 text-center"> </TableHead>
            <TableHead className="min-w-[200px]">Name</TableHead>
            <TableHead className="w-24 text-right text-muted-foreground">
              Type
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const selected = isEntrySelected(entry);
            return (
              <TableRow
                key={entry.name}
                data-state={selected ? "selected" : undefined}
                className={cn("cursor-pointer select-none", selected && "bg-muted")}
                onClick={() => onSelect(entry)}
                onDoubleClick={() => handleDoubleClick(entry)}
              >
                <TableCell className="w-10 py-2 text-center">
                  <EntryIcon isDirectory={entry.isDirectory} />
                </TableCell>
                <TableCell className="min-w-0 font-medium">
                  <span
                    className="block max-w-full truncate select-none"
                    title={entry.name}
                  >
                    {entry.name}
                  </span>
                </TableCell>
                <TableCell className="w-24 py-2 text-right text-sm text-muted-foreground select-none">
                  {entry.isDirectory ? "Folder" : "File"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
