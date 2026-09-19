//* tests/components/auth/OTPField.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import OTPField from "@/components/auth/OTPField";

const LABEL = "Email verification code";
const ERROR = "Invalid verification code. Please try again.";

const renderField = (errorMessage?: string) =>
	render(
		<OTPField
			label={LABEL}
			value=""
			onChange={vi.fn()}
			errorMessage={errorMessage}
		/>,
	);

// input-otp renders one real <input> behind the six display slots; every
// assertion below targets that input through the accessibility tree.
const getInput = () => screen.getByRole("textbox", { name: LABEL });

describe("OTPField — accessible name", () => {
	it("names the underlying input with the label it was given", () => {
		renderField();

		expect(getInput()).toBeInTheDocument();
	});
});

describe("OTPField — error wiring", () => {
	it("marks the input invalid while an error is showing", () => {
		renderField(ERROR);

		expect(getInput()).toHaveAttribute("aria-invalid", "true");
	});

	it("describes the input with the error text", () => {
		renderField(ERROR);

		expect(getInput()).toHaveAccessibleDescription(ERROR);
	});

	it("leaves the input undescribed while there is no error", () => {
		renderField();

		expect(getInput()).not.toHaveAttribute("aria-describedby");
		expect(getInput()).toHaveAccessibleDescription("");
	});
});
