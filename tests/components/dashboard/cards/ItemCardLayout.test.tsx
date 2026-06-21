//* tests/components/dashboard/cards/ItemCardLayout.test.tsx

import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithRouter } from "../../../lib/render";
import ItemCardLayout from "@/components/dashboard/cards/ItemCardLayout";

describe("ItemCardLayout — list view activation", () => {
	it("renders the row as a link carrying the name when `to` is provided (folder semantics, #89)", () => {
		renderWithRouter(
			<ItemCardLayout
				view="list"
				to={{ search: "?dir=f1" }}
				icon={<span data-testid="icon" />}
				name={<p>Reports</p>}
				modified={<span>Apr 15</span>}
				size={<span>1 KB</span>}
				actions={<button type="button">More actions</button>}
				onActivate={() => {}}
			/>,
		);

		const link = screen.getByRole("link", { name: /reports/i });
		expect(link.getAttribute("href")).toContain("?dir=f1");
	});

	it("renders the row as a button (not a link) firing onActivate when `to` is omitted (file semantics, #89)", async () => {
		const user = userEvent.setup();
		const onActivate = vi.fn();

		renderWithRouter(
			<ItemCardLayout
				view="list"
				icon={<span data-testid="icon" />}
				name={<p>report.pdf</p>}
				modified={<span>Apr 15</span>}
				size={<span>2 KB</span>}
				actions={<button type="button">More actions</button>}
				onActivate={onActivate}
			/>,
		);

		expect(screen.queryByRole("link", { name: /report\.pdf/i })).toBeNull();
		await user.click(screen.getByRole("button", { name: /report\.pdf/i }));
		expect(onActivate).toHaveBeenCalledTimes(1);
	});
});

describe("ItemCardLayout — grid view activation", () => {
	it("renders an imperative button (never a link, even with `to`) that fires onActivate on click", async () => {
		const user = userEvent.setup();
		const onActivate = vi.fn();

		renderWithRouter(
			<ItemCardLayout
				view="grid"
				to={{ search: "?dir=f1" }}
				icon={<span data-testid="icon" />}
				name={<p>Reports</p>}
				actions={<button type="button">More actions</button>}
				onActivate={onActivate}
			/>,
		);

		expect(screen.queryByRole("link")).toBeNull();
		await user.click(screen.getByRole("button", { name: /reports/i }));
		expect(onActivate).toHaveBeenCalledTimes(1);
	});

	it("activates on Enter — the imperative grid card's keyboard affordance", async () => {
		const user = userEvent.setup();
		const onActivate = vi.fn();

		renderWithRouter(
			<ItemCardLayout
				view="grid"
				icon={<span data-testid="icon" />}
				name={<p>Reports</p>}
				actions={<button type="button">More actions</button>}
				onActivate={onActivate}
			/>,
		);

		screen.getByRole("button", { name: /reports/i }).focus();
		await user.keyboard("{Enter}");
		expect(onActivate).toHaveBeenCalledTimes(1);
	});

	it("activates on Space — full ARIA button keyboard contract", async () => {
		const user = userEvent.setup();
		const onActivate = vi.fn();

		renderWithRouter(
			<ItemCardLayout
				view="grid"
				icon={<span data-testid="icon" />}
				name={<p>Reports</p>}
				actions={<button type="button">More actions</button>}
				onActivate={onActivate}
			/>,
		);

		screen.getByRole("button", { name: /reports/i }).focus();
		await user.keyboard(" ");
		expect(onActivate).toHaveBeenCalledTimes(1);
	});
});
