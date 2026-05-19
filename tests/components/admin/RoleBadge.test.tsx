//* tests/components/admin/RoleBadge.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RoleBadge from "@/components/admin/RoleBadge";

describe("RoleBadge", () => {
	it("renders 'User' label for user role", () => {
		render(<RoleBadge role="user" />);
		expect(screen.getByText("User")).toBeInTheDocument();
	});

	it("renders 'Admin' label for admin role", () => {
		render(<RoleBadge role="admin" />);
		expect(screen.getByText("Admin")).toBeInTheDocument();
	});

	it("renders 'Superadmin' label for superadmin role", () => {
		render(<RoleBadge role="superadmin" />);
		expect(screen.getByText("Superadmin")).toBeInTheDocument();
	});

	it("applies accent tokens to the superadmin badge", () => {
		render(<RoleBadge role="superadmin" />);
		const badge = screen.getByText("Superadmin");
		expect(badge.className).toMatch(/bg-accent/);
		expect(badge.className).toMatch(/text-accent-foreground/);
	});

	it("applies the consumer-provided className", () => {
		render(<RoleBadge role="admin" className="custom-class" />);
		expect(screen.getByText("Admin")).toHaveClass("custom-class");
	});
});
