//* src/components/dashboard/ToolbarDropdown.tsx

import { useRef } from "react";
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
	onUpload: (files: FileList) => void;
}

/**
 * Toolbar with a single "New" dropdown button.
 * Groups all creation actions (new folder, upload, future import) under one menu.
 * Uses a hidden file input to trigger the native file picker for uploads.
 */
const ToolbarDropdown = ({ onNewFolder, onUpload }: ToolbarDropdownProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	/** Open the native file picker when "Upload Files" is clicked */
	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	/** Pass selected files to the parent and reset the input */
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files && files.length > 0) {
			onUpload(files);
		}
		e.target.value = "";
	};

	return (
		<>
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

					<DropdownMenuItem onClick={handleUploadClick} className="cursor-pointer">
						<Upload className="mr-2 size-4" />
						Upload Files
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Hidden file input for upload — supports multiple files */}
			<input
				ref={fileInputRef}
				type="file"
				multiple
				onChange={handleFileChange}
				className="hidden"
			/>
		</>
	);
};

export default ToolbarDropdown;
