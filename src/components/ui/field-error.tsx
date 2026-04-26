//* src/components/ui/field-error.tsx

import { AlertCircle } from "lucide-react";

import cn from "@/lib/utils";

interface FieldErrorProps {
	message?: string;
	className?: string;
}

/**
 * Inline field-level error shown directly below an input. Renders nothing when
 * `message` is falsy, so it's safe to mount unconditionally next to any field.
 */
const FieldError = ({ message, className }: FieldErrorProps) => {
	if (!message) return null;

	return (
		<div
			role="alert"
			className={cn(
				"flex items-center gap-1.5 mt-1 text-xs text-danger",
				className,
			)}
		>
			<AlertCircle size={12} />
			<span>{message}</span>
		</div>
	);
};

export default FieldError;
