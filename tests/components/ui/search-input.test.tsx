//* tests/components/ui/search-input.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchInput from "@/components/ui/search-input";

describe("SearchInput", () => {
	it("renders the placeholder text", () => {
		render(<SearchInput value="" onChange={vi.fn()} placeholder="Find me" />);
		expect(screen.getByPlaceholderText("Find me")).toBeInTheDocument();
	});

	it("fires onChange with each character typed", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<SearchInput value="" onChange={onChange} placeholder="Find me" />,
		);

		await user.type(screen.getByPlaceholderText("Find me"), "ab");

		// Controlled input stays at "" so each keystroke fires onChange with the
		// single new char rather than the accumulated string.
		expect(onChange).toHaveBeenNthCalledWith(1, "a");
		expect(onChange).toHaveBeenNthCalledWith(2, "b");
	});

	it("hides the clear button when value is empty", () => {
		render(<SearchInput value="" onChange={vi.fn()} />);
		expect(
			screen.queryByRole("button", { name: /clear search/i }),
		).toBeNull();
	});

	it("shows the clear button when value is non-empty", () => {
		render(<SearchInput value="abc" onChange={vi.fn()} />);
		expect(
			screen.getByRole("button", { name: /clear search/i }),
		).toBeInTheDocument();
	});

	it("clicking clear fires onChange with an empty string", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<SearchInput value="abc" onChange={onChange} />);

		await user.click(screen.getByRole("button", { name: /clear search/i }));
		expect(onChange).toHaveBeenCalledWith("");
	});

	it("clicking clear also fires onClear when provided", async () => {
		const user = userEvent.setup();
		const onClear = vi.fn();
		render(
			<SearchInput value="abc" onChange={vi.fn()} onClear={onClear} />,
		);

		await user.click(screen.getByRole("button", { name: /clear search/i }));
		expect(onClear).toHaveBeenCalledTimes(1);
	});

	it("uses a custom clearLabel for the clear button's accessible name", () => {
		render(
			<SearchInput
				value="abc"
				onChange={vi.fn()}
				clearLabel="Reset filter"
			/>,
		);
		expect(
			screen.getByRole("button", { name: "Reset filter" }),
		).toBeInTheDocument();
	});
});
