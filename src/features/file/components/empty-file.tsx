import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/components/ui/empty";
import { FolderIcon } from "lucide-react";

export function EmptyFile() {
    return (
        <div className="flex flex-1 items-center justify-center h-full">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <FolderIcon className="size-6" aria-hidden />
                    </EmptyMedia>
                    <EmptyTitle>This folder is empty</EmptyTitle>
                    <EmptyDescription>
                        There are no files or folders in this location.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        </div >
    );
}