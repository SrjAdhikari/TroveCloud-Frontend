//* tests/components/admin/ProviderIcon.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProviderIcon from "@/components/admin/ProviderIcon";

describe("ProviderIcon", () => {
	it("renders the accessible label 'Email' for the email provider", () => {
		render(<ProviderIcon provider="email" />);
		expect(screen.getByText("Email")).toBeInTheDocument();
	});

	it("renders the accessible label 'Google' for the google provider", () => {
		render(<ProviderIcon provider="google" />);
		expect(screen.getByText("Google")).toBeInTheDocument();
	});

	it("renders the accessible label 'GitHub' for the github provider", () => {
		render(<ProviderIcon provider="github" />);
		expect(screen.getByText("GitHub")).toBeInTheDocument();
	});

	it("exposes the provider label via the title attribute for hover tooltips", () => {
		const { container } = render(<ProviderIcon provider="google" />);
		expect(container.querySelector("span[title='Google']")).toBeTruthy();
	});

	it("applies the consumer-provided className", () => {
		const { container } = render(
			<ProviderIcon provider="email" className="custom-class" />,
		);
		expect(container.querySelector(".custom-class")).toBeTruthy();
	});
});
