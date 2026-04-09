//* src/components/form/FormField.tsx

import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldProps extends React.ComponentProps<"input"> {
	label: string;
	error?: string;
}

/**
 * Reusable form field — renders a label, input, and error message.
 * When type is "password", adds a show/hide toggle automatically.
 * Uses forwardRef so React Hook Form's register() can attach its ref.
 */
const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
	({ label, error, type, id, ...props }, ref) => {
		const [showPassword, setShowPassword] = useState(false);
		const isPassword = type === "password";

		return (
			<div className="space-y-2">
				<Label htmlFor={id}>{label}</Label>

				<div className="relative">
					<Input
						id={id}
						ref={ref}
						type={isPassword && showPassword ? "text" : type}
						aria-invalid={!!error}
						{...props}
					/>

					{isPassword && (
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
						>
							{showPassword ? (
								<EyeOff className="size-4" />
							) : (
								<Eye className="size-4" />
							)}
						</button>
					)}
				</div>

				{error && <span className="text-sm text-destructive">{error}</span>}
			</div>
		);
	},
);

FormField.displayName = "FormField";

export default FormField;
