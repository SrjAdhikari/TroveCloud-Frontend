//* tests/lib/adminAction.test.ts

import { describe, it, expect } from "vitest";
import canPerformAdminAction, { type AdminAction } from "@/lib/adminAction";
import type { UserPayload, UserRole } from "@/types/auth.types";
import type { UserItemPayload, UserStatus } from "@/types/admin.types";

const callerBase = {
	_id: "caller-1",
	name: "Caller",
	email: "caller@example.com",
	rootDirId: "r1",
	profilePicture: null,
	isVerified: true,
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
};

const targetBase = {
	...callerBase,
	_id: "target-1",
	email: "target@example.com",
	provider: "email" as const,
	suspendedAt: null,
	suspendedBy: null,
	deletedAt: null,
};

const makeCaller = (role: UserRole, id = "caller-1"): UserPayload => ({
	...callerBase,
	role,
	_id: id,
});

const makeTarget = (
	overrides: { role?: UserRole; status?: UserStatus; id?: string } = {},
): UserItemPayload => {
	const { role = "user", status = "active", id = "target-1" } = overrides;
	return {
		...targetBase,
		_id: id,
		role,
		status,
	};
};

describe("canPerformAdminAction", () => {
	it("allows superadmin to suspend an active user-role target", () => {
		const caller = makeCaller("superadmin");
		const target = makeTarget();
		expect(canPerformAdminAction(caller, target, "suspend")).toBe(true);
	});

	it("rejects every action when the target is the caller", () => {
		const caller = makeCaller("superadmin", "self-id");
		const target = makeTarget({ id: "self-id", role: "superadmin" });
		expect(canPerformAdminAction(caller, target, "suspend")).toBe(false);
		expect(canPerformAdminAction(caller, target, "forceLogout")).toBe(false);
	});

	it("rejects every action when the caller does not strictly outrank the target", () => {
		const peer = makeCaller("superadmin");
		const peerTarget = makeTarget({ role: "superadmin", id: "other-superadmin" });
		expect(canPerformAdminAction(peer, peerTarget, "suspend")).toBe(false);

		const admin = makeCaller("admin");
		const adminTarget = makeTarget({ role: "admin", id: "another-admin" });
		expect(canPerformAdminAction(admin, adminTarget, "forceLogout")).toBe(false);
	});

	it("allows admin caller to force-logout a user-role target", () => {
		const caller = makeCaller("admin");
		const target = makeTarget();
		expect(canPerformAdminAction(caller, target, "forceLogout")).toBe(true);
	});

	it("rejects admin caller for every action other than force-logout", () => {
		const caller = makeCaller("admin");
		const target = makeTarget();
		expect(canPerformAdminAction(caller, target, "suspend")).toBe(false);
		expect(canPerformAdminAction(caller, target, "changeRole")).toBe(false);
		expect(canPerformAdminAction(caller, target, "softDelete")).toBe(false);
		expect(canPerformAdminAction(caller, target, "hardDelete")).toBe(false);
		expect(canPerformAdminAction(caller, target, "restore")).toBe(false);
		expect(canPerformAdminAction(caller, target, "unsuspend")).toBe(false);
	});

	it("rejects user-role caller for every action (rank 0 cannot outrank anyone)", () => {
		const caller = makeCaller("user");
		const target = makeTarget();
		expect(canPerformAdminAction(caller, target, "suspend")).toBe(false);
		expect(canPerformAdminAction(caller, target, "forceLogout")).toBe(false);
		expect(canPerformAdminAction(caller, target, "hardDelete")).toBe(false);
	});

	it("rejects admin caller acting on a superadmin target", () => {
		const caller = makeCaller("admin");
		const target = makeTarget({ role: "superadmin", id: "the-superadmin" });
		expect(canPerformAdminAction(caller, target, "forceLogout")).toBe(false);
		expect(canPerformAdminAction(caller, target, "suspend")).toBe(false);
	});

	describe("state preconditions (superadmin caller, user-role target)", () => {
		const caller = makeCaller("superadmin");

		it.each<{ action: AdminAction; status: UserStatus; expected: boolean }>([
			// suspend requires active
			{ action: "suspend", status: "active", expected: true },
			{ action: "suspend", status: "suspended", expected: false },
			{ action: "suspend", status: "deleted", expected: false },
			// unsuspend requires suspended
			{ action: "unsuspend", status: "active", expected: false },
			{ action: "unsuspend", status: "suspended", expected: true },
			{ action: "unsuspend", status: "deleted", expected: false },
			// restore requires deleted
			{ action: "restore", status: "active", expected: false },
			{ action: "restore", status: "suspended", expected: false },
			{ action: "restore", status: "deleted", expected: true },
			// softDelete requires not-deleted
			{ action: "softDelete", status: "active", expected: true },
			{ action: "softDelete", status: "suspended", expected: true },
			{ action: "softDelete", status: "deleted", expected: false },
			// changeRole requires not-deleted
			{ action: "changeRole", status: "active", expected: true },
			{ action: "changeRole", status: "suspended", expected: true },
			{ action: "changeRole", status: "deleted", expected: false },
			// forceLogout requires not-deleted
			{ action: "forceLogout", status: "active", expected: true },
			{ action: "forceLogout", status: "suspended", expected: true },
			{ action: "forceLogout", status: "deleted", expected: false },
			// hardDelete has no state precondition
			{ action: "hardDelete", status: "active", expected: true },
			{ action: "hardDelete", status: "suspended", expected: true },
			{ action: "hardDelete", status: "deleted", expected: true },
		])("$action on $status target → $expected", ({ action, status, expected }) => {
			const target = makeTarget({ status });
			expect(canPerformAdminAction(caller, target, action)).toBe(expected);
		});
	});
});
