//* src/components/settings/StorageTab.tsx

import { Database, Crown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AlertBanner from "@/components/ui/alert-banner";

import useStorageUsage from "@/hooks/useStorageUsage";

import { formatBytes } from "@/lib/formatters";
import {
	getUsagePercent,
	getUsageBarColor,
	buildBreakdown,
} from "@/lib/storage";

/** Storage settings tab — real usage overview, per-category breakdown */
const StorageTab = () => {
	const { data: storageResponse, isLoading, isError } = useStorageUsage();
	const usage = storageResponse?.data;

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Card className="bg-background">
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
						<Skeleton className="h-8 w-40" />
						<Skeleton className="h-3 w-full rounded-full" />
						<div className="space-y-3">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-1.5 w-full rounded-full" />
							<Skeleton className="h-1.5 w-full rounded-full" />
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isError || !usage) {
		return (
			<AlertBanner variant="error">
				Unable to load your storage usage. Please refresh and try again.
			</AlertBanner>
		);
	}

	const usedPercent = getUsagePercent(usage.used, usage.total);
	const breakdown = buildBreakdown(usage);

	return (
		<div className="space-y-6">
			{/* Usage overview */}
			<Card className="bg-background">
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
							<span className="text-lg font-semibold">
								{formatBytes(usage.used)}
							</span>
							<span className="text-sm text-muted-foreground">
								of {formatBytes(usage.total)} used
							</span>
						</div>

						<div
							className="mt-3 h-3 w-full overflow-hidden rounded-full bg-muted"
							role="progressbar"
							aria-valuenow={usedPercent}
							aria-valuemin={0}
							aria-valuemax={100}
							aria-label={`Storage used: ${formatBytes(usage.used)} of ${formatBytes(usage.total)}`}
						>
							<div
								className={`h-full rounded-full transition-all ${getUsageBarColor(usedPercent)}`}
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

						{breakdown.length === 0 ? (
							<p className="text-sm text-muted-foreground">No files yet.</p>
						) : (
							breakdown.map(
								({ label, size, widthPercent, icon: Icon, barColor }) => (
									<div key={label}>
										<div className="flex items-center justify-between text-sm">
											<div className="flex items-center gap-2">
												<Icon className="size-3.5 text-muted-foreground" />
												<span>{label}</span>
											</div>
											<span className="text-muted-foreground">{size}</span>
										</div>

										<div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
											<div
												className={`h-full rounded-full ${barColor}`}
												style={{ width: `${widthPercent}%` }}
											/>
										</div>
									</div>
								),
							)
						)}
					</div>
				</CardContent>
			</Card>

			{/* Plan */}
			<Card className="bg-background">
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<Crown className="size-4" />
						Your plan
					</CardTitle>
					<CardDescription>
						You are currently on the <strong>Free</strong> plan with{" "}
						{formatBytes(usage.total)} of storage.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<div className="flex items-center justify-between rounded-lg border p-4">
						<div>
							<p className="text-sm font-medium">Free Plan</p>
							<p className="text-xs text-muted-foreground">
								{formatBytes(usage.total)} storage &middot; Basic features
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
