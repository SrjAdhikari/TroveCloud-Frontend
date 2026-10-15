//* src/components/dashboard/cards/ItemActions.tsx

import type { ReactNode } from "react";
import {
	Download,
	EllipsisVertical,
	Eye,
	FolderInput,
	Info,
	Link,
	Pencil,
	Share2,
	Star,
	Trash2,
	type LucideIcon,
} from "lucide-react";

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
	onDetails: () => void;
	onPreview?: () => void;
	onDownload?: () => void;
}

interface MenuItemProps {
	icon: LucideIcon;
	children: ReactNode;
	onClick?: () => void;
	disabled?: boolean;
	variant?: "default" | "destructive";
}

/** One menu item with an icon and a label. */
const MenuItem = ({
	icon: Icon,
	children,
	onClick,
	disabled,
	variant,
}: MenuItemProps) => {
	return (
		<DropdownMenuItem
			disabled={disabled}
			variant={variant}
			onSelect={
				onClick
					? (e) => {
							e.stopPropagation();
							onClick();
						}
					: undefined
			}
			className={`gap-2 px-2.5 py-1.5 text-[13px] focus:bg-muted focus:text-foreground not-data-[variant=destructive]:focus:**:text-foreground ${
				disabled ? "" : "cursor-pointer"
			}`}
		>
			<Icon aria-hidden="true" className="size-3.5" />
			{children}
		</DropdownMenuItem>
	);
};

/** The three-dot menu on a file or folder card. */
const ItemActions = ({
	onRename,
	onDelete,
	onDetails,
	onPreview,
	onDownload,
}: ItemActionsProps) => {
	return (
		// Cards open something when clicked. Stop clicks on this menu from
		// reaching the card, or using the menu would also open the file or folder.
		// (Radix's onSelect alone doesn't stop the click from reaching the card.)
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					aria-label="More actions"
					className="size-7 shrink-0 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
					onClick={(e) => e.stopPropagation()}
				>
					<EllipsisVertical aria-hidden="true" className="size-4" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="end"
				side="bottom"
				avoidCollisions={false}
				onClick={(e) => e.stopPropagation()}
				className="min-w-44 bg-background p-1.5"
			>
				<MenuItem icon={Info} onClick={onDetails}>
					Details
				</MenuItem>

				{onPreview && (
					<MenuItem icon={Eye} onClick={onPreview}>
						Preview
					</MenuItem>
				)}

				<MenuItem icon={Pencil} onClick={onRename}>
					Rename
				</MenuItem>

				<MenuItem icon={Star} disabled>Add to Favorites</MenuItem>
				<MenuItem icon={Share2} disabled>Share</MenuItem>
				<MenuItem icon={FolderInput} disabled>Move to</MenuItem>

				{onDownload && (
					<MenuItem icon={Download} onClick={onDownload}>
						Download
					</MenuItem>
				)}

				<MenuItem icon={Link} disabled>Copy link</MenuItem>

				<MenuItem icon={Trash2} variant="destructive" onClick={onDelete}>
					Move to Trash
				</MenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ItemActions;
