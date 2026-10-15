//* src/api/drive.api.ts

import axiosClient from "@/config/axiosClient";
import type { ApiSuccessResponse } from "@/types/api.types";
import type {
	DriveImportPayload,
	DriveImportResult,
} from "@/types/drive.types";

const importFromDrive = async (payload: DriveImportPayload) => {
	const { data } = await axiosClient.post<
		ApiSuccessResponse<DriveImportResult>
	>("/drive/import", payload);
	return data;
};

export default importFromDrive;
