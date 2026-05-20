//* src/pages/AdminUserDetailPage.tsx

import { useParams } from "react-router";
import { Calendar } from "lucide-react";

import RoleBadge from "@/components/admin/RoleBadge";
import StatusBadge from "@/components/admin/StatusBadge";
import UserActivityCard from "@/components/admin/UserActivityCard";
import UserDetailLoadFailed from "@/components/admin/UserDetailLoadFailed";
import UserProfileCard from "@/components/admin/UserProfileCard";
import LoadingSpinner from "@/components/ui/loading-spinner";

import { useUserDetail } from "@/hooks/useAdmin";
import { formatDate } from "@/lib/formatters";

/**
 * Read-only detail page for a single user in the admin console.
 * Shows the user's profile and activity info in two cards, with a header
 */
const AdminUserDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const { data, isLoading, error } = useUserDetail(id);

	if (isLoading) return <LoadingSpinner fullScreen />;
	if (error) return <UserDetailLoadFailed error={error} />;

	// Type narrower, not a runtime branch — `data.data` is non-optional per
	// ApiSuccessResponse<T>, but useQuery types `data` as `T | undefined`
	// across its discriminated states.
	const user = data?.data;
	if (!user) return null;

	return (
		<div className="space-y-6">
			<header className="border-b border-border pb-6">
				<div className="mb-2 flex items-center gap-3">
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">
						{user.name}
					</h1>
					<StatusBadge status={user.status} />
				</div>

				<div className="flex items-center gap-4 text-sm text-muted-foreground">
					<RoleBadge role={user.role} />
					<span className="flex items-center gap-1.5">
						<Calendar
							aria-hidden="true"
							className="size-4 text-foreground/70"
						/>
						Joined {formatDate(user.createdAt)}
					</span>
				</div>
			</header>

			<div className="grid gap-6 lg:grid-cols-2">
				<UserProfileCard user={user} />
				<UserActivityCard stats={user.stats} />
			</div>
		</div>
	);
};

export default AdminUserDetailPage;
