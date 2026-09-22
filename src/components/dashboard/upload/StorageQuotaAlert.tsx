//* src/components/dashboard/upload/StorageQuotaAlert.tsx

import { formatBytes } from "@/lib/formatters";
import AlertBanner from "@/components/ui/alert-banner";

interface StorageQuotaAlertProps {
	id: string;
	blocked: boolean;
	remaining: number;
	selectedSize: number;
}

const StorageQuotaAlert = ({
	id,
	blocked,
	remaining,
	selectedSize,
}: StorageQuotaAlertProps) => {
	if (!blocked) return null;

	return (
		<AlertBanner id={id} variant="error">
			<p>
				Not enough storage.{" "}
				<span className="font-medium">{formatBytes(remaining)}</span> left, this
				selection needs{" "}
				<span className="font-medium">{formatBytes(selectedSize)}</span> —{" "}
				{remaining === 0
					? "delete some files to free up space."
					: "remove some files to continue."}
			</p>
		</AlertBanner>
	);
};

export default StorageQuotaAlert;
