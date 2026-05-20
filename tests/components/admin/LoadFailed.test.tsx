//* tests/components/admin/LoadFailed.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import LoadFailed from "@/components/admin/LoadFailed";

const fallback = {
	title: "Generic fallback title",
	description: "Generic fallback description",
};

const errorCopy = {
	KNOWN_CODE: {
		title: "Known code title",
		description: "Known code description",
	},
};

describe("LoadFailed", () => {
	it("resolves title + description from errorCopy when the error code is mapped", () => {
		render(
			<LoadFailed
				error={{ code: "KNOWN_CODE", message: "irrelevant" }}
				errorCopy={errorCopy}
				fallback={fallback}
			/>,
		);

		expect(screen.getByText("Known code title")).toBeInTheDocument();
		expect(screen.getByText("Known code description")).toBeInTheDocument();
	});

	it("falls back to the fallback prop when the error code is not in errorCopy", () => {
		render(
			<LoadFailed
				error={{ code: "UNMAPPED_CODE", message: "leaked backend text" }}
				errorCopy={errorCopy}
				fallback={fallback}
			/>,
		);

		expect(screen.getByText("Generic fallback title")).toBeInTheDocument();
		expect(
			screen.getByText("Generic fallback description"),
		).toBeInTheDocument();
		expect(screen.queryByText(/leaked backend text/i)).toBeNull();
	});

	it("wraps content in role='alert' so screen readers announce the failure", () => {
		render(
			<LoadFailed
				error={{ code: "KNOWN_CODE", message: "" }}
				errorCopy={errorCopy}
				fallback={fallback}
			/>,
		);

		expect(screen.getByRole("alert")).toBeInTheDocument();
	});
});
