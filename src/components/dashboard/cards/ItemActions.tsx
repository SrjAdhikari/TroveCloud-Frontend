//* src/components/dashboard/cards/ItemActions.tsx

import { EllipsisVertical, Eye, Pencil, Download, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ItemActionsProps {
	onRename: () => void;
	onDelete: () => void;
	onPreview?: () => void;
	onDownload?: () => void;
}

/**
 * Three-dot dropdown menu with actions for a file or folder card.
 * Download action is only shown for files (when onDownload is provided).
 */
const ItemActions = ({ onRename, onDelete, onPreview, onDownload }: ItemActionsProps) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="size-7 shrink-0 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
					onClick={(e) => e.stopPropagation()}
				>
					<EllipsisVertical className="size-4" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="min-w-40 p-1.5">
				{onPreview && (
					<DropdownMenuItem
						onClick={(e) => {
							e.stopPropagation();
							onPreview();
						}}
						className="cursor-pointer gap-2 px-2.5 py-1.5 text-[13px]"
					>
						<Eye className="size-3.5" />
						Preview
					</DropdownMenuItem>
				)}

				<DropdownMenuItem
					onClick={(e) => {
						e.stopPropagation();
						onRename();
					}}
					className="cursor-pointer gap-2 px-2.5 py-1.5 text-[13px]"
				>
					<Pencil className="size-3.5" />
					Rename
				</DropdownMenuItem>

				{onDownload && (
					<DropdownMenuItem
						onClick={(e) => {
							e.stopPropagation();
							onDownload();
						}}
						className="cursor-pointer gap-2 px-2.5 py-1.5 text-[13px]"
					>
						<Download className="size-3.5" />
						Download
					</DropdownMenuItem>
				)}

				<DropdownMenuItem
					variant="destructive"
					onClick={(e) => {
						e.stopPropagation();
						onDelete();
					}}
					className="cursor-pointer gap-2 px-2.5 py-1.5 text-[13px]"
				>
					<Trash2 className="size-3.5" />
					Move to Trash
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ItemActions;
