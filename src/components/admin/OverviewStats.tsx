//* src/components/admin/OverviewStats.tsx

import {
	LogIn,
	Database,
	ShieldCheck,
	UserRoundCheck,
	UsersRound,
} from "lucide-react";

import { formatFileSize, formatNumber } from "@/lib/formatters";

import StatCard from "@/components/admin/StatCard";
import type { SystemOverviewPayload } from "@/types/admin.types";

interface OverviewStatsProps {
	overview: SystemOverviewPayload;
}

/**
 * Renders the populated admin overview as a single-row responsive grid of
 * stat cards. Every card uses the same header + row-list structure so they
 * read as a uniform scannable block.
 */
const OverviewStats = ({ overview }: OverviewStatsProps) => {
	const { users, storage, signups, sessions } = overview;

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
			<StatCard
				label="Users"
				icon={UsersRound}
				breakdown={[
					{ label: "Active", value: formatNumber(users.active) },
					{ label: "Suspended", value: formatNumber(users.suspended) },
					{ label: "Deleted", value: formatNumber(users.softDeleted) },
				]}
			/>

			<StatCard
				label="Roles"
				icon={ShieldCheck}
				breakdown={[
					{ label: "User", value: formatNumber(users.byRole.user) },
					{ label: "Admin", value: formatNumber(users.byRole.admin) },
					{
						label: "Superadmin",
						value: formatNumber(users.byRole.superadmin),
					},
				]}
			/>

			<StatCard
				label="Storage"
				icon={Database}
				breakdown={[
					{ label: "Total", value: formatFileSize(storage.totalBytes) },
					{ label: "Files", value: formatNumber(storage.totalFiles) },
					{
						label: "Directories",
						value: formatNumber(storage.totalDirectories),
					},
				]}
			/>

			<StatCard
				label="Signups"
				icon={UserRoundCheck}
				breakdown={[
					{ label: "Last 7 days", value: formatNumber(signups.last7d) },
					{ label: "Last 30 days", value: formatNumber(signups.last30d) },
				]}
			/>

			<StatCard
				label="Sessions"
				icon={LogIn}
				breakdown={[{ label: "Active", value: formatNumber(sessions.active) }]}
			/>
		</div>
	);
};

export default OverviewStats;
