//* tests/components/admin/UsersPagination.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UsersPagination from "@/components/admin/UsersPagination";

describe("UsersPagination", () => {
	it("renders 'Page X of Y' text", () => {
		render(
			<UsersPagination
				page={2}
				totalPages={5}
				onPrev={vi.fn()}
				onNext={vi.fn()}
			/>,
		);
		expect(screen.getByText(/page 2 of 5/i)).toBeInTheDocument();
	});

	it("disables Previous on the first page", () => {
		render(
			<UsersPagination
				page={1}
				totalPages={5}
				onPrev={vi.fn()}
				onNext={vi.fn()}
			/>,
		);
		expect(screen.getByRole("button", { name: /^prev$/i })).toBeDisabled();
		expect(screen.getByRole("button", { name: /next/i })).toBeEnabled();
	});

	it("disables Next on the last page", () => {
		render(
			<UsersPagination
				page={5}
				totalPages={5}
				onPrev={vi.fn()}
				onNext={vi.fn()}
			/>,
		);
		expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
		expect(screen.getByRole("button", { name: /^prev$/i })).toBeEnabled();
	});

	it("fires onPrev when Previous is clicked", async () => {
		const user = userEvent.setup();
		const onPrev = vi.fn();
		render(
			<UsersPagination
				page={3}
				totalPages={5}
				onPrev={onPrev}
				onNext={vi.fn()}
			/>,
		);
		await user.click(screen.getByRole("button", { name: /^prev$/i }));
		expect(onPrev).toHaveBeenCalledTimes(1);
	});

	it("fires onNext when Next is clicked", async () => {
		const user = userEvent.setup();
		const onNext = vi.fn();
		render(
			<UsersPagination
				page={3}
				totalPages={5}
				onPrev={vi.fn()}
				onNext={onNext}
			/>,
		);
		await user.click(screen.getByRole("button", { name: /next/i }));
		expect(onNext).toHaveBeenCalledTimes(1);
	});

	it("moves focus to Next when clicking Prev lands on the first page", async () => {
		const user = userEvent.setup();
		const { rerender } = render(
			<UsersPagination
				page={2}
				totalPages={5}
				onPrev={vi.fn()}
				onNext={vi.fn()}
			/>,
		);

		const prevBtn = screen.getByRole("button", { name: /^prev$/i });
		const nextBtn = screen.getByRole("button", { name: /next/i });

		prevBtn.focus();
		await user.click(prevBtn);
		// Parent re-renders with the new page; Prev becomes disabled.
		rerender(
			<UsersPagination
				page={1}
				totalPages={5}
				onPrev={vi.fn()}
				onNext={vi.fn()}
			/>,
		);

		expect(document.activeElement).toBe(nextBtn);
	});

	it("moves focus to Prev when clicking Next lands on the last page", async () => {
		const user = userEvent.setup();
		const { rerender } = render(
			<UsersPagination
				page={4}
				totalPages={5}
				onPrev={vi.fn()}
				onNext={vi.fn()}
			/>,
		);

		const prevBtn = screen.getByRole("button", { name: /^prev$/i });
		const nextBtn = screen.getByRole("button", { name: /next/i });

		nextBtn.focus();
		await user.click(nextBtn);
		rerender(
			<UsersPagination
				page={5}
				totalPages={5}
				onPrev={vi.fn()}
				onNext={vi.fn()}
			/>,
		);

		expect(document.activeElement).toBe(prevBtn);
	});
});
