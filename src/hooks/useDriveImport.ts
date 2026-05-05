//* src/hooks/useDriveImport.ts

import { useMutation } from "@tanstack/react-query";
import importFromDrive from "@/api/drive.api";

/**
 * Mutation hook for importing picked items from Google Drive into TroveCloud.
 */
const useDriveImport = () => {
	return useMutation({ mutationFn: importFromDrive });
};

export default useDriveImport;
