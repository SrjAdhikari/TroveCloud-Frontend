//* src/components/admin/UsersToolbar.tsx

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import FilterSelect from "@/components/ui/filter-select";
import SearchInput from "@/components/ui/search-input";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import type { UserRole } from "@/types/auth.types";
import type { UserStatus } from "@/types/admin.types";

interface UsersToolbarProps {
	localQuery: string;
	onLocalQueryChange: (value: string) => void;
	role: UserRole | undefined;
	status: UserStatus | undefined;
	includeDeleted: boolean;
	onRoleChange: (role: UserRole | undefined) => void;
	onStatusChange: (status: UserStatus | undefined) => void;
	onIncludeDeletedChange: (checked: boolean) => void;
}

const ROLE_OPTIONS: ReadonlyArray<{ value: UserRole; label: string }> = [
	{ value: "user", label: "User" },
	{ value: "admin", label: "Admin" },
	{ value: "superadmin", label: "Superadmin" },
];

const STATUS_OPTIONS: ReadonlyArray<{ value: UserStatus; label: string }> = [
	{ value: "active", label: "Active" },
	{ value: "suspended", label: "Suspended" },
	{ value: "deleted", label: "Deleted" },
];

/**
 * Toolbar above the users table — search + role/status filters + include-deleted
 * toggle. All state comes from the parent; this component is pure presentation.
 */
const UsersToolbar = ({
	localQuery,
	onLocalQueryChange,
	role,
	status,
	includeDeleted,
	onRoleChange,
	onStatusChange,
	onIncludeDeletedChange,
}: UsersToolbarProps) => {
	const statusFilterActive = status !== undefined;

	return (
		<div className="flex flex-col gap-5 md:flex-row md:flex-wrap md:items-center">
			<SearchInput
				value={localQuery}
				onChange={onLocalQueryChange}
				placeholder="Search by name or email"
				className="w-full md:max-w-xs"
			/>

			<FilterSelect<UserRole>
				value={role}
				onChange={onRoleChange}
				allLabel="All roles"
				options={ROLE_OPTIONS}
				className="md:w-40"
			/>

			<FilterSelect<UserStatus>
				value={status}
				onChange={onStatusChange}
				allLabel="All statuses"
				options={STATUS_OPTIONS}
				className="md:w-44"
			/>

			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex items-center gap-2">
						<Switch
							id="include-deleted"
							checked={includeDeleted}
							onCheckedChange={(checked) =>
								onIncludeDeletedChange(checked === true)
							}
							disabled={statusFilterActive}
						/>

						<Label
							htmlFor="include-deleted"
							className={
								statusFilterActive
									? "cursor-not-allowed text-muted-foreground"
									: "cursor-pointer"
							}
						>
							Include deleted
						</Label>
					</div>
				</TooltipTrigger>

				{statusFilterActive && (
					<TooltipContent>Only applies when Status is All</TooltipContent>
				)}
			</Tooltip>
		</div>
	);
};

export default UsersToolbar;
