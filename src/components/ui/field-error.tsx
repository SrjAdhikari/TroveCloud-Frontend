//* src/components/ui/field-error.tsx

import { AlertCircle } from "lucide-react";

import cn from "@/lib/utils";

interface FieldErrorProps {
	id?: string;
	message?: string;
	className?: string;
}

/**
 * Error text shown under a field. Shows nothing if there's no `message`.
 * Pass `id` and point the input's `aria-describedby` at it so screen readers
 * read the error.
 */
const FieldError = ({ id, message, className }: FieldErrorProps) => {
	if (!message) return null;

	return (
		<div
			id={id}
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
