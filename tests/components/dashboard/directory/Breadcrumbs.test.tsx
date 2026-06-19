//* tests/components/dashboard/directory/Breadcrumbs.test.tsx

import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";

import { renderWithRouter } from "../../../lib/render";
import Breadcrumbs from "@/components/dashboard/directory/Breadcrumbs";
import type { DirectoryCrumbPayload } from "@/types/directory.types";

// Self-inclusive trail: root → … → current (last entry is "you are here").
const trail: DirectoryCrumbPayload[] = [
	{ _id: "root", name: "root-suraj@example.com" },
	{ _id: "p1", name: "Projects" },
	{ _id: "d1", name: "Documents" },
];

describe("Breadcrumbs", () => {
	it("renders the root crumb as a 'My Files' link, not the raw root name", () => {
		renderWithRouter(<Breadcrumbs breadcrumb={trail} />);

		const root = screen.getByRole("link", { name: "My Files" });
		expect(root).toHaveAttribute("href", "/my-files");
		expect(screen.queryByText("root-suraj@example.com")).not.toBeInTheDocument();
	});

	it("renders intermediate folders as ?dir links", () => {
		renderWithRouter(<Breadcrumbs breadcrumb={trail} />);

		const projects = screen.getByRole("link", { name: "Projects" });
		expect(projects).toHaveAttribute("href", "/my-files?dir=p1");
	});

	it("renders the current folder once as a non-link page", () => {
		renderWithRouter(<Breadcrumbs breadcrumb={trail} />);

		// Self-inclusive gotcha: the current folder must not be duplicated.
		const current = screen.getAllByText("Documents");
		expect(current).toHaveLength(1);
		expect(current[0]).toHaveAttribute("aria-current", "page");
		expect(current[0]).not.toHaveAttribute("href");
	});

	it("collapses intermediate crumbs behind an ellipsis when the trail is deep", () => {
		const deep: DirectoryCrumbPayload[] = [
			{ _id: "root", name: "root" },
			{ _id: "a", name: "Alpha" },
			{ _id: "b", name: "Beta" },
			{ _id: "c", name: "Gamma" },
			{ _id: "d", name: "Delta" },
			{ _id: "cur", name: "Current" },
		];
		renderWithRouter(<Breadcrumbs breadcrumb={deep} />);

		// Ellipsis present; only the last two intermediates survive.
		expect(screen.getByText("More")).toBeInTheDocument();
		expect(screen.queryByRole("link", { name: "Alpha" })).not.toBeInTheDocument();
		expect(screen.queryByRole("link", { name: "Beta" })).not.toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Gamma" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Delta" })).toBeInTheDocument();
	});

	it("renders only a 'My Files' link + current when one level deep", () => {
		renderWithRouter(
			<Breadcrumbs
				breadcrumb={[
					{ _id: "root", name: "root-x" },
					{ _id: "d1", name: "Documents" },
				]}
			/>,
		);

		expect(screen.getByRole("link", { name: "My Files" })).toHaveAttribute(
			"href",
			"/my-files",
		);
		expect(screen.getByText("Documents")).toHaveAttribute(
			"aria-current",
			"page",
		);
	});

	it("shows 'My Files' as the current page, never the raw root name, at root", () => {
		renderWithRouter(
			<Breadcrumbs
				breadcrumb={[{ _id: "root", name: "root-suraj@example.com" }]}
			/>,
		);

		expect(screen.getByText("My Files")).toHaveAttribute(
			"aria-current",
			"page",
		);
		expect(
			screen.queryByText("root-suraj@example.com"),
		).not.toBeInTheDocument();
	});

	it("renders nothing when the breadcrumb is empty", () => {
		const { container } = renderWithRouter(<Breadcrumbs breadcrumb={[]} />);
		expect(container).toBeEmptyDOMElement();
	});
});
