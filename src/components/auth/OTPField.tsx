//* src/components/auth/OTPField.tsx

import { REGEXP_ONLY_DIGITS } from "input-otp";

import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";

interface OTPFieldProps {
	value: string;
	onChange: (value: string) => void;
	errorMessage?: string | null;
	disabled?: boolean;
	autoFocus?: boolean;
}

/**
 * A shared 6-slot OTP entry component.
 *
 * Props:
 * - value: The current OTP value.
 * - onChange: A callback function that receives the OTP value when it changes.
 * - errorMessage: An optional error message to display below the OTP input.
 * - disabled: If true, the OTP input will be disabled.
 * - autoFocus: If true, the OTP input will be focused when the component mounts.
 */
const OTPField = ({
	value,
	onChange,
	errorMessage,
	disabled = false,
	autoFocus = false,
}: OTPFieldProps) => {
	return (
		<div className="flex flex-col items-center space-y-2">
			<InputOTP
				maxLength={6}
				value={value}
				pattern={REGEXP_ONLY_DIGITS}
				onChange={onChange}
				disabled={disabled}
				autoFocus={autoFocus}
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

			{errorMessage && (
				<p role="alert" className="text-center text-sm text-destructive">
					{errorMessage}
				</p>
			)}
		</div>
	);
};

export default OTPField;
