//* tests/components/dashboard/SearchBar.test.tsx

import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSearchParams } from "react-router";

import SearchBar from "@/components/dashboard/SearchBar";
import { renderWithRouter } from "../../lib/render";

const QueryParamProbe = () => {
	const [params] = useSearchParams();
	return <div data-testid="q">{params.get("q") ?? ""}</div>;
};

const UrlSetter = ({ next }: { next: string }) => {
	const [, setParams] = useSearchParams();
	return (
		<button data-testid="set-url" onClick={() => setParams({ q: next })}>
			Set URL
		</button>
	);
};

describe("SearchBar", () => {
	it("hydrates the input value from the URL `q` param on mount", () => {
		renderWithRouter(
			<>
				<SearchBar />
				<QueryParamProbe />
			</>,
			{ initialEntries: ["/?q=initial"] },
		);

		expect(screen.getByPlaceholderText(/search files/i)).toHaveValue(
			"initial",
		);
	});

	it("debounces typing by 300ms before writing to the URL `q` param", async () => {
		const user = userEvent.setup();
		renderWithRouter(
			<>
				<SearchBar />
				<QueryParamProbe />
			</>,
		);

		await user.type(screen.getByPlaceholderText(/search files/i), "abc");

		// URL hasn't caught up yet — still inside the 300ms debounce window.
		expect(screen.getByTestId("q")).toBeEmptyDOMElement();

		await waitFor(
			() => {
				expect(screen.getByTestId("q")).toHaveTextContent("abc");
			},
			{ timeout: 1000 },
		);
	});

	it("re-syncs the input when the URL `q` param changes after mount", async () => {
		const user = userEvent.setup();
		renderWithRouter(
			<>
				<SearchBar />
				<UrlSetter next="other" />
			</>,
			{ initialEntries: ["/?q=initial"] },
		);

		const input = screen.getByPlaceholderText(/search files/i);
		expect(input).toHaveValue("initial");

		await user.click(screen.getByTestId("set-url"));

		expect(input).toHaveValue("other");
	});

	it("clears the URL `q` param immediately when the X button is clicked", async () => {
		const user = userEvent.setup();
		renderWithRouter(
			<>
				<SearchBar />
				<QueryParamProbe />
			</>,
			{ initialEntries: ["/?q=alpha"] },
		);

		expect(screen.getByTestId("q")).toHaveTextContent("alpha");

		await user.click(screen.getByRole("button", { name: /clear search/i }));

		// No debounce wait — `onClear` flushes the URL update directly.
		expect(screen.getByTestId("q")).toBeEmptyDOMElement();
	});
});
