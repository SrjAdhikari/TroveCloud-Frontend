//* tests/components/form/FormField.test.tsx

import type { ComponentProps } from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FormField from "@/components/form/FormField";

const LABEL = "Password";
const ERROR = "Password must be at least 8 characters.";
const CONFIRM_LABEL = "Confirm password";
const CONFIRM_ERROR = "Passwords must match.";

const renderField = (props: Partial<ComponentProps<typeof FormField>> = {}) =>
	render(<FormField label={LABEL} id="password" {...props} />);

describe("FormField — label association", () => {
	it("associates the label with the input", () => {
		renderField();

		expect(screen.getByLabelText(LABEL)).toBeInTheDocument();
	});

	it("keeps the label associated while an error is showing", () => {
		renderField({ error: ERROR });

		expect(screen.getByLabelText(LABEL)).toBeInTheDocument();
	});
});

describe("FormField — error wiring", () => {
	it("marks the input invalid while an error is showing", () => {
		renderField({ error: ERROR });

		expect(screen.getByLabelText(LABEL)).toHaveAttribute(
			"aria-invalid",
			"true",
		);
	});

	it("describes the input with the error text", () => {
		renderField({ error: ERROR });

		expect(screen.getByLabelText(LABEL)).toHaveAccessibleDescription(ERROR);
	});

	it("points aria-describedby at the element that renders the message", () => {
		renderField({ error: ERROR });

		const alert = screen.getByRole("alert");

		expect(alert).toHaveTextContent(ERROR);
		expect(screen.getByLabelText(LABEL)).toHaveAttribute(
			"aria-describedby",
			alert.id,
		);
	});

	it("gives sibling fields distinct error ids", () => {
		render(
			<>
				<FormField label={LABEL} id="password" error={ERROR} />
				<FormField label={CONFIRM_LABEL} id="confirm" error={CONFIRM_ERROR} />
			</>,
		);

		const password = screen.getByLabelText(LABEL);
		const confirm = screen.getByLabelText(CONFIRM_LABEL);

		expect(password).toHaveAccessibleDescription(ERROR);
		expect(confirm).toHaveAccessibleDescription(CONFIRM_ERROR);
		expect(password.getAttribute("aria-describedby")).not.toBe(
			confirm.getAttribute("aria-describedby"),
		);
	});

	it("leaves the input undescribed and unflagged while there is no error", () => {
		renderField();

		const input = screen.getByLabelText(LABEL);

		expect(input).not.toHaveAttribute("aria-describedby");
		expect(input).toHaveAccessibleDescription("");
		expect(input).toHaveAttribute("aria-invalid", "false");
		expect(screen.queryByRole("alert")).toBeNull();
	});
});

describe("FormField — password variant", () => {
	it("renders the show/hide toggle", () => {
		renderField({ type: "password" });

		expect(
			screen.getByRole("button", { name: /show password/i }),
		).toBeInTheDocument();
	});

	it("toggles the input between password and text", async () => {
		const user = userEvent.setup();
		renderField({ type: "password" });

		const input = screen.getByLabelText(LABEL);
		expect(input).toHaveAttribute("type", "password");

		await user.click(screen.getByRole("button", { name: /show password/i }));
		expect(input).toHaveAttribute("type", "text");

		await user.click(screen.getByRole("button", { name: /hide password/i }));
		expect(input).toHaveAttribute("type", "password");
	});

	it("still describes the password input with its error text", () => {
		renderField({ type: "password", error: ERROR });

		expect(screen.getByLabelText(LABEL)).toHaveAccessibleDescription(ERROR);
	});
});
