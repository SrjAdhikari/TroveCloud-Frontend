//* src/components/dashboard/ToolbarDropdown.tsx

import { CirclePlus, FolderPlus, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ToolbarDropdownProps {
	onNewFolder: () => void;
}

/**
 * Toolbar with a single "New" dropdown button.
 * Groups all creation actions (new folder, upload, future import) under one menu.
 */
const ToolbarDropdown = ({ onNewFolder }: ToolbarDropdownProps) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="cursor-pointer">
					<CirclePlus className="mr-2 size-4" />
					New
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="min-w-50">
				<DropdownMenuItem onClick={onNewFolder} className="cursor-pointer">
					<FolderPlus className="mr-2 size-4" />
					New Folder
				</DropdownMenuItem>

				<DropdownMenuItem className="cursor-pointer">
					<Upload className="mr-2 size-4" />
					Upload Files
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ToolbarDropdown;
