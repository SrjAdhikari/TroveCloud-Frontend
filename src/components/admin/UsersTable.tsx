//* src/components/admin/UsersTable.tsx

import { Link } from "react-router";
import { UsersRound } from "lucide-react";

import EmptyStatePlaceholder from "@/components/ui/empty-state-placeholder";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ProviderIcon from "@/components/admin/ProviderIcon";
import RoleBadge from "@/components/admin/RoleBadge";
import StatusBadge from "@/components/admin/StatusBadge";

import cn from "@/lib/utils";
import getInitials from "@/lib/getInitials";
import { formatDate } from "@/lib/formatters";

import { adminUserDetailPath } from "@/routes/paths";
import type { UserItemPayload } from "@/types/admin.types";

interface UsersTableProps {
	items: UserItemPayload[];
	isFetching: boolean;
	isFiltered: boolean;
	page: number;
	totalPages: number;
	onClearFilters: () => void;
	onResetPage: () => void;
}

const TABLE_GRID =
	"grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_2fr_3fr_1fr_1fr_1fr] lg:grid-cols-[auto_2fr_3fr_1fr_1fr_1fr_1fr]";

const ROW_SUBGRID =
	"col-span-full grid grid-cols-subgrid items-center gap-3 md:gap-4 px-4 py-3";

/**
 * Header + body grid for the admin users list. Renders three empty-state
 * variants (cold / filtered / out-of-range) and dims the table while a
 * background refetch is in flight (via `isFetching`).
 */
const UsersTable = ({
	items,
	isFetching,
	isFiltered,
	page,
	totalPages,
	onClearFilters,
	onResetPage,
}: UsersTableProps) => {
	if (items.length === 0) {
		if (isFetching) {
			return (
				<div className="flex justify-center py-16">
					<LoadingSpinner />
				</div>
			);
		}

		if (page > totalPages && totalPages > 0) {
			return (
				<EmptyStatePlaceholder
					icon={UsersRound}
					title="No users on this page."
					description="The page you're looking for doesn't exist. Try going back to the first page."
				>
					<Button variant="outline" onClick={onResetPage}>
						Back to page 1
					</Button>
				</EmptyStatePlaceholder>
			);
		}

		if (isFiltered) {
			return (
				<EmptyStatePlaceholder
					icon={UsersRound}
					title="No users match these filters."
					description="Try widening the search or clearing the filters to see all users."
				>
					<Button variant="outline" onClick={onClearFilters}>
						Clear filters
					</Button>
				</EmptyStatePlaceholder>
			);
		}

		return (
			<EmptyStatePlaceholder
				icon={UsersRound}
				title="No users yet."
				description="When users sign up they'll appear here."
			/>
		);
	}

	return (
		<section className={cn("transition-opacity", isFetching && "opacity-60")}>
			<div className={TABLE_GRID}>
				<div
					className={cn(
						"hidden md:grid col-span-full grid-cols-subgrid items-center gap-4 px-4 pb-3",
						"border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground",
					)}
				>
					<span aria-hidden="true" className="size-8" />
					<span>Name</span>
					<span className="text-center">Email</span>
					<span className="text-center">Provider</span>
					<span className="text-center">Role</span>
					<span className="text-center">Status</span>
					<span className="hidden lg:block text-center">Joined</span>
				</div>

				{items.map((user) => (
					<Link
						key={user._id}
						to={adminUserDetailPath(user._id)}
						className={cn(
							ROW_SUBGRID,
							"border-b border-border transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
						)}
					>
						<Avatar className="size-8">
							<AvatarImage
								src={user.profilePicture ?? undefined}
								alt={user.name}
							/>
							<AvatarFallback className="text-xs font-medium">
								{getInitials(user.name)}
							</AvatarFallback>
						</Avatar>

						{/* Mobile view: name + email stacked, hidden on desktop */}
						<div className="min-w-0 md:hidden">
							<p className="truncate text-sm font-medium">{user.name}</p>

							<p className="truncate text-xs text-muted-foreground">
								{user.email}
							</p>
						</div>

						{/* Desktop view: name, email, provider, role, status, joined date */}
						<p className="hidden md:block min-w-0 truncate text-sm font-medium">
							{user.name}
						</p>

						<p className="hidden md:block min-w-0 truncate text-center text-sm text-muted-foreground">
							{user.email}
						</p>

						<ProviderIcon
							provider={user.provider}
							className="hidden md:inline-flex justify-self-center"
						/>

						<RoleBadge
							role={user.role}
							className="hidden md:inline-flex justify-self-center"
						/>

						<StatusBadge status={user.status} className="justify-self-center" />

						<span className="hidden lg:block whitespace-nowrap text-center text-sm text-muted-foreground">
							{formatDate(user.createdAt)}
						</span>
					</Link>
				))}
			</div>
		</section>
	);
};

export default UsersTable;
