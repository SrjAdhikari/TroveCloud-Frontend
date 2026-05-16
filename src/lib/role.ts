//* src/lib/role.ts

import type { UserRole } from "@/types/auth.types";

/**
 * Checks if the given role is admin or superadmin.
 *
 * @param role - The role to check.
 * @returns True if the role is admin or superadmin, false otherwise.
 */
const isAdminRole = (role: UserRole | undefined): boolean =>
	role === "admin" || role === "superadmin";

export default isAdminRole;
