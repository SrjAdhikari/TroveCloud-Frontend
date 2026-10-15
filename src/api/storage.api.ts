//* src/api/storage.api.ts

import axiosClient from "@/config/axiosClient";
import type { ApiSuccessResponse } from "@/types/api.types";
import type { StorageUsage } from "@/types/storage.types";

/** Gets storage used, split by file type. */
const getStorageUsage = async () => {
	const { data } =
		await axiosClient.get<ApiSuccessResponse<StorageUsage>>("/storage/usage");
	return data;
};

export default getStorageUsage;
