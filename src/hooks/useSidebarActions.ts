//* src/hooks/useSidebarActions.ts

import { useState, useEffect } from "react";

/** Opens the right dialog when an option in the sidebar "New" menu is used. */
const useSidebarActions = () => {
	const [showCreateFolder, setShowCreateFolder] = useState(false);
	const [showUpload, setShowUpload] = useState(false);
	const [showDriveImport, setShowDriveImport] = useState(false);

	useEffect(() => {
		const handleAction = (e: Event) => {
			const action = (e as CustomEvent).detail;

			if (action === "new-folder") setShowCreateFolder(true);
			if (action === "upload-files") setShowUpload(true);
			if (action === "import-from-drive") setShowDriveImport(true);
		};

		window.addEventListener("dashboard:action", handleAction);
		return () => window.removeEventListener("dashboard:action", handleAction);
	}, []);

	return {
		showCreateFolder,
		setShowCreateFolder,
		showUpload,
		setShowUpload,
		showDriveImport,
		setShowDriveImport,
	};
};

export default useSidebarActions;
