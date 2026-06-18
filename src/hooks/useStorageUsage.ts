//* src/hooks/useStorageUsage.ts

import { useQuery } from "@tanstack/react-query";
import getStorageUsage from "@/api/storage.api";

/** Query hook for the current user's storage usage */
const useStorageUsage = () => {
	return useQuery({
		queryKey: ["storageUsage"],
		queryFn: getStorageUsage,
	});
};

export default useStorageUsage;
