//* src/components/form/FormField.tsx

import { useId, useState, forwardRef, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FieldError from "@/components/ui/field-error";
import cn from "@/lib/utils";

interface FormFieldProps extends React.ComponentProps<"input"> {
	label: string;
	labelExtra?: ReactNode;
	error?: string;
}

/**
 * A label, input, and error message. Password fields get a show/hide button.
 * `labelExtra` goes to the right of the label, e.g. a "Forgot password?" link.
 * Uses forwardRef so React Hook Form's register() can reach the input.
 */
const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
	({ label, labelExtra, error, type, id, className, ...props }, ref) => {
		const [showPassword, setShowPassword] = useState(false);
		const errorId = useId();
		const isPassword = type === "password";

		return (
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label htmlFor={id}>{label}</Label>
					{labelExtra}
				</div>

				<div className="relative">
					<Input
						id={id}
						ref={ref}
						type={isPassword && showPassword ? "text" : type}
						aria-invalid={!!error}
						aria-describedby={error ? errorId : undefined}
						{...props}
						className={cn(isPassword && "pr-11", className)}
					/>

					{isPassword && (
						<button
							type="button"
							aria-label={showPassword ? "Hide password" : "Show password"}
							aria-pressed={showPassword}
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
						>
							{showPassword ? (
								<EyeOff className="size-4" />
							) : (
								<Eye className="size-4" />
							)}
						</button>
					)}
				</div>

				<FieldError id={errorId} message={error} />
			</div>
		);
	},
);

FormField.displayName = "FormField";

export default FormField;
