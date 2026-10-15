//* src/lib/role.ts

import type { UserRole } from "@/types/auth.types";

/** True for both "admin" and "superadmin". */
const isAdminRole = (role: UserRole | undefined): boolean =>
	role === "admin" || role === "superadmin";

export default isAdminRole;
