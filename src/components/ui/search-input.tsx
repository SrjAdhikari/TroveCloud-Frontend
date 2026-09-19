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
 * Search input with an embedded search icon and a clear button that appears
 * when there's text. The clear button always calls `onChange("")` to reset
 * the value; pass `onClear` to run an additional side-effect (e.g. flushing
 * URL state that bypasses upstream debouncing).
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
