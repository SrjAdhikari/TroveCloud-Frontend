//* tests/components/admin/StatusBadge.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBadge from "@/components/admin/StatusBadge";

describe("StatusBadge", () => {
	it("renders 'Active' label for active status", () => {
		render(<StatusBadge status="active" />);
		expect(screen.getByText("Active")).toBeInTheDocument();
	});

	it("renders 'Suspended' label for suspended status", () => {
		render(<StatusBadge status="suspended" />);
		expect(screen.getByText("Suspended")).toBeInTheDocument();
	});

	it("renders 'Deleted' label for deleted status", () => {
		render(<StatusBadge status="deleted" />);
		expect(screen.getByText("Deleted")).toBeInTheDocument();
	});

	it("uses muted tokens for the deleted state — never destructive", () => {
		render(<StatusBadge status="deleted" />);
		const badge = screen.getByText("Deleted");
		expect(badge.className).toMatch(/bg-muted/);
		expect(badge.className).toMatch(/text-muted-foreground/);
		expect(badge.className).not.toMatch(/text-destructive/);
	});

	it("applies the consumer-provided className alongside the variant", () => {
		render(<StatusBadge status="active" className="custom-class" />);
		expect(screen.getByText("Active")).toHaveClass("custom-class");
	});
});
