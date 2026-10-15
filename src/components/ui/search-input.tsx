//* src/components/ui/search-input.tsx

import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import cn from "@/lib/utils";

interface SearchInputProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	onClear?: () => void;
	placeholder?: string;
	className?: string;
	clearLabel?: string;
}

/**
 * Search box with an icon and a clear (X) button that shows when there's
 * text. Clearing calls `onChange("")`, and also `onClear` if you pass it.
 */
const SearchInput = ({
	label,
	value,
	onChange,
	onClear,
	placeholder,
	className,
	clearLabel = "Clear search",
}: SearchInputProps) => (
	<div className={cn("relative", className)}>
		<Search
			aria-hidden="true"
			className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
		/>

		<Input
			type="text"
			aria-label={label}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			className="h-9 w-full rounded-lg border-border pl-9 pr-9 text-sm placeholder:text-muted-foreground transition-colors"
		/>

		{value && (
			<button
				type="button"
				onClick={() => {
					onChange("");
					onClear?.();
				}}
				className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
				aria-label={clearLabel}
			>
				<X className="size-4" />
			</button>
		)}
	</div>
);

export default SearchInput;
