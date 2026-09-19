//* src/components/auth/OTPField.tsx

import { useId } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";

import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import FieldError from "@/components/ui/field-error";

interface OTPFieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	errorMessage?: string | null;
	disabled?: boolean;
	autoFocus?: boolean;
}

/**
 * A shared 6-slot OTP entry component.
 *
 * `input-otp` renders one real input behind the slots and spreads `InputOTP`
 * props onto it, so the name, invalid state and error association go there;
 * the slots keep `aria-invalid` purely to drive their red border.
 */
const OTPField = ({
	label,
	value,
	onChange,
	errorMessage,
	disabled = false,
	autoFocus = false,
}: OTPFieldProps) => {
	const errorId = useId();

	return (
		<div className="flex flex-col items-center space-y-2">
			<InputOTP
				maxLength={6}
				value={value}
				pattern={REGEXP_ONLY_DIGITS}
				onChange={onChange}
				disabled={disabled}
				autoFocus={autoFocus}
				aria-label={label}
				aria-invalid={!!errorMessage}
				aria-describedby={errorMessage ? errorId : undefined}
				containerClassName="gap-3"
			>
				{Array.from({ length: 6 }, (_, i) => (
					<InputOTPGroup key={i}>
						<InputOTPSlot
							index={i}
							className="size-12 text-lg"
							aria-invalid={!!errorMessage}
						/>
					</InputOTPGroup>
				))}
			</InputOTP>

			<FieldError id={errorId} message={errorMessage ?? undefined} />
		</div>
	);
};

export default OTPField;
