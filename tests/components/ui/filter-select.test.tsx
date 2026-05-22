//* tests/components/ui/filter-select.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterSelect from "@/components/ui/filter-select";

type Fruit = "apple" | "banana" | "cherry";

const OPTIONS: ReadonlyArray<{ value: Fruit; label: string }> = [
	{ value: "apple", label: "Apple" },
	{ value: "banana", label: "Banana" },
	{ value: "cherry", label: "Cherry" },
];

describe("FilterSelect", () => {
	it("shows the all-label on the trigger when value is undefined", () => {
		render(
			<FilterSelect<Fruit>
				value={undefined}
				onChange={vi.fn()}
				allLabel="All fruits"
				options={OPTIONS}
			/>,
		);
		expect(screen.getByText("All fruits")).toBeInTheDocument();
	});

	it("renders the current value's label when set", () => {
		render(
			<FilterSelect<Fruit>
				value="banana"
				onChange={vi.fn()}
				allLabel="All fruits"
				options={OPTIONS}
			/>,
		);
		expect(screen.getByText("Banana")).toBeInTheDocument();
	});

	it("opens the dropdown and emits the selected option's value", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<FilterSelect<Fruit>
				value={undefined}
				onChange={onChange}
				allLabel="All fruits"
				options={OPTIONS}
			/>,
		);

		await user.click(screen.getByRole("combobox"));
		await user.click(screen.getByRole("option", { name: "Cherry" }));

		expect(onChange).toHaveBeenCalledWith("cherry");
	});

	it("emits undefined when the 'All' sentinel is picked", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<FilterSelect<Fruit>
				value="banana"
				onChange={onChange}
				allLabel="All fruits"
				options={OPTIONS}
			/>,
		);

		await user.click(screen.getByRole("combobox"));
		await user.click(screen.getByRole("option", { name: "All fruits" }));

		expect(onChange).toHaveBeenCalledWith(undefined);
	});

	describe("without allLabel — required pick", () => {
		it("does not render an 'All' sentinel option", async () => {
			const user = userEvent.setup();
			render(
				<FilterSelect<Fruit>
					value="apple"
					onChange={vi.fn()}
					options={OPTIONS}
				/>,
			);

			await user.click(screen.getByRole("combobox"));

			expect(screen.queryByRole("option", { name: /all/i })).toBeNull();
			expect(screen.getAllByRole("option")).toHaveLength(OPTIONS.length);
		});

		it("emits the picked value (never undefined)", async () => {
			const user = userEvent.setup();
			const onChange = vi.fn();
			render(
				<FilterSelect<Fruit>
					value="apple"
					onChange={onChange}
					options={OPTIONS}
				/>,
			);

			await user.click(screen.getByRole("combobox"));
			await user.click(screen.getByRole("option", { name: "Cherry" }));

			expect(onChange).toHaveBeenCalledWith("cherry");
		});
	});
});
