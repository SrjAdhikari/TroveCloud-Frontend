//* src/components/settings/StorageTab.tsx

import {
	Database,
	FileText,
	Image,
	Video,
	FileArchive,
	Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

/**
 * Placeholder storage breakdown data.
 * Will be replaced with real data once the backend supports storage analytics.
 */
const storageBreakdown = [
	{
		label: "Documents",
		size: "850 MB",
		color: "bg-blue-500",
		width: "35%",
		icon: FileText,
	},
	{
		label: "Images",
		size: "720 MB",
		color: "bg-green-500",
		width: "30%",
		icon: Image,
	},
	{
		label: "Videos",
		size: "580 MB",
		color: "bg-purple-500",
		width: "24%",
		icon: Video,
	},
	{
		label: "Other",
		size: "250 MB",
		color: "bg-orange-500",
		width: "11%",
		icon: FileArchive,
	},
];

/**
 * Storage settings tab — usage breakdown and plan management.
 * All data is hardcoded placeholder until backend supports storage endpoints.
 */
const StorageTab = () => {
	/** TODO: Replace hardcoded values with real storage data once backend supports it */
	const usedGB = 2.4;
	const totalGB = 10;
	const usedPercent = Math.round((usedGB / totalGB) * 100);

	return (
		<div className="space-y-6">
			{/* Usage overview */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<Database className="size-4" />
						Storage usage
					</CardTitle>
					<CardDescription>
						Your current storage usage across TroveCloud.
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-7">
					{/* Total usage bar */}
					<div>
						<div className="flex items-baseline justify-between">
							<span className="text-2xl font-semibold">{usedGB} GB</span>
							<span className="text-sm text-muted-foreground">
								of {totalGB} GB used
							</span>
						</div>

						<div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-muted">
							<div
								className="h-full rounded-full bg-blue-500 transition-all"
								style={{ width: `${usedPercent}%` }}
							/>
						</div>

						<p className="mt-2 text-xs text-muted-foreground">
							{100 - usedPercent}% of your storage is available.
						</p>
					</div>

					{/* Breakdown by file type */}
					<div className="space-y-3">
						<h3 className="text-sm font-medium">Breakdown by type</h3>

						{storageBreakdown.map(
							({ label, size, color, width, icon: Icon }) => (
								<div key={label}>
									<div className="flex items-center justify-between text-sm">
										<div className="flex items-center gap-2">
											<Icon className="size-3.5 text-muted-foreground" />
											<span>{label}</span>
										</div>
										<span className="text-muted-foreground">{size}</span>
									</div>

									<div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
										<div
											className={`h-full rounded-full ${color}`}
											style={{ width }}
										/>
									</div>
								</div>
							),
						)}
					</div>
				</CardContent>
			</Card>

			{/* Plan */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<Crown className="size-4" />
						Your plan
					</CardTitle>
					<CardDescription>
						You are currently on the <strong>Free</strong> plan with {totalGB}{" "}
						GB of storage.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<div className="flex items-center justify-between rounded-lg border p-4">
						<div>
							<p className="text-sm font-medium">Free Plan</p>
							<p className="text-xs text-muted-foreground">
								{totalGB} GB storage &middot; Basic features
							</p>
						</div>
						<Button
							variant="outline"
							size="sm"
							disabled
							className="cursor-not-allowed"
						>
							Upgrade
						</Button>
					</div>
					<p className="mt-2 text-xs text-muted-foreground">
						Plan upgrades coming soon.
					</p>
				</CardContent>
			</Card>
		</div>
	);
};

export default StorageTab;
