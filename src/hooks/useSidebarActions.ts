//* src/hooks/useSidebarActions.ts

import { useState, useEffect } from "react";

/**
 * Listens for custom DOM events dispatched by the sidebar "New" button
 * and manages the dialog open states for creating folders and uploading files.
 */
const useSidebarActions = () => {
	const [showCreateFolder, setShowCreateFolder] = useState(false);
	const [showUpload, setShowUpload] = useState(false);

	useEffect(() => {
		const handleAction = (e: Event) => {
			const action = (e as CustomEvent).detail;
			if (action === "new-folder") setShowCreateFolder(true);
			if (action === "upload-files") setShowUpload(true);
		};

		window.addEventListener("dashboard:action", handleAction);
		return () => window.removeEventListener("dashboard:action", handleAction);
	}, []);

	return {
		showCreateFolder,
		setShowCreateFolder,
		showUpload,
		setShowUpload,
	};
};

export default useSidebarActions;
