//* src/hooks/useDriveImport.ts

import { useMutation } from "@tanstack/react-query";
import importFromDrive from "@/api/drive.api";

const useDriveImport = () => {
	return useMutation({ mutationFn: importFromDrive });
};

export default useDriveImport;
