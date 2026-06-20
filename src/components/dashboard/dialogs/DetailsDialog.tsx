//* src/components/dashboard/dialogs/DetailsDialog.tsx

import type { ReactNode } from "react";

import { formatBytes, formatDateTime, formatNumber } from "@/lib/formatters";
import { getFileIcon, getFolderIcon } from "@/lib/iconMapper";

import type {
	DirectoryItemPayload,
	FileItemPayload,
} from "@/types/directory.types";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

type DetailsDialogProps = {
	onClose: () => void;
	currentPath: string;
} & (
	| { type: "file"; item: FileItemPayload }
	| { type: "folder"; item: DirectoryItemPayload }
);

// A short metadata row — label on the left, value flush right on a single line.
const DetailRow = ({ label, value }: { label: string; value: ReactNode }) => (
	<div className="flex items-center justify-between gap-4 text-sm">
		<span className="shrink-0 text-muted-foreground">{label}</span>
		<span className="min-w-0 truncate text-foreground">{value}</span>
	</div>
);

// Approx chars that fit the path value on one line in this ~280px-wide dialog.
// Past it, the path drops to a stacked, wrapping block so nothing gets clipped.
const PATH_INLINE_MAX = 32;

// Path stays an inline DetailRow until it's too long for one line, then becomes
// a full-width wrapping block so the whole location stays readable.
const PathDetail = ({ path }: { path: string }) =>
	path.length <= PATH_INLINE_MAX ? (
		<DetailRow label="Path" value={path} />
	) : (
		<div className="space-y-1.5">
			<span className="text-sm text-muted-foreground">Path</span>
			<p className="break-all rounded-md bg-muted/50 px-2.5 py-1.5 text-xs text-foreground">
				{path}
			</p>
		</div>
	);

// Type-appropriate header icon: image for files, themed Lucide chip for folders.
const HeaderIcon = (props: DetailsDialogProps) => {
	if (props.type === "file") {
		return (
			<img
				src={getFileIcon(props.item.extension).src}
				alt=""
				className="size-8 shrink-0"
			/>
		);
	}

	const { icon: Icon, color, bg } = getFolderIcon(props.item.name);
	return (
		<div
			className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${bg}`}
		>
			<Icon aria-hidden="true" className={`size-5 ${color}`} />
		</div>
	);
};

/** Read-only dialog showing a file or folder's metadata */
const DetailsDialog = (props: DetailsDialogProps) => {
	const { onClose, currentPath } = props;
	const { name, createdAt, updatedAt } = props.item;

	const fullPath = `${currentPath}/${name}`;
	const sizeBytes =
		props.type === "file" ? props.item.size : props.item.totalSize;
	const sizeText = sizeBytes != null ? formatBytes(sizeBytes) : "—";

	return (
		<Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent className="min-w-xs max-w-xs sm:max-w-xs gap-0 p-0 max-sm:min-w-[calc(100%-2rem)] bg-background">
				<DialogHeader className="min-w-0 flex-row items-center gap-3 space-y-0 pl-5 pr-12 pt-5 pb-3">
					<HeaderIcon {...props} />

					<div className="min-w-0 text-left">
						<DialogTitle className="truncate text-sm font-medium">
							{name}
						</DialogTitle>
						<DialogDescription className="text-xs">
							{props.type === "file"
								? `${props.item.extension.replace(".", "").toUpperCase()} file`
								: "Folder"}
						</DialogDescription>
					</div>
				</DialogHeader>

				<Separator />

				<div className="min-w-0 space-y-4 px-5 pb-5 pt-3">
					{props.type === "folder" && (
						<>
							<DetailRow
								label="Files"
								value={
									props.item.fileCount != null
										? formatNumber(props.item.fileCount)
										: "—"
								}
							/>
							<DetailRow
								label="Folders"
								value={
									props.item.folderCount != null
										? formatNumber(props.item.folderCount)
										: "—"
								}
							/>
						</>
					)}

					<DetailRow label="Size" value={sizeText} />
					<DetailRow label="Created" value={formatDateTime(createdAt)} />
					<DetailRow label="Modified" value={formatDateTime(updatedAt)} />
					<PathDetail path={fullPath} />
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default DetailsDialog;
