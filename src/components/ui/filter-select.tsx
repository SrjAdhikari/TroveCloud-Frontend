//* src/components/ui/filter-select.tsx

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import cn from "@/lib/utils";

interface FilterSelectOption<T extends string> {
	value: T;
	label: string;
}

interface FilterSelectBase<T extends string> {
	label: string;
	options: ReadonlyArray<FilterSelectOption<T>>;
	className?: string;
}

// With `allLabel`, an "All" option is added and no pick (`undefined`) is
// allowed. Without it, a value must be picked.
type FilterSelectProps<T extends string> =
	| (FilterSelectBase<T> & {
			value: T | undefined;
			onChange: (value: T | undefined) => void;
			allLabel: string;
	  })
	| (FilterSelectBase<T> & {
			value: T;
			onChange: (value: T) => void;
			allLabel?: undefined;
	  });

// Radix Select doesn't allow an empty value, so "All" uses this stand-in.
const ALL = "__all__";

/**
 * A dropdown of `{ value, label }` options. Pass `allLabel` to add an "All"
 * option for filters.
 */
const FilterSelect = <T extends string>({
	label,
	value,
	onChange,
	allLabel,
	options,
	className,
}: FilterSelectProps<T>) => {
	// Check for undefined on purpose: an empty `allLabel` still counts.
	const hasAllLabel = allLabel !== undefined;

	return (
		<Select
			value={hasAllLabel ? (value ?? ALL) : value}
			onValueChange={(v) => {
				if (hasAllLabel) {
					onChange(v === ALL ? undefined : (v as T));
				} else {
					onChange(v as T);
				}
			}}
		>
			<SelectTrigger aria-label={label} className={cn("w-full", className)}>
				<SelectValue />
			</SelectTrigger>

			<SelectContent position="popper">
				{hasAllLabel && <SelectItem value={ALL}>{allLabel}</SelectItem>}
				{options.map((opt) => (
					<SelectItem key={opt.value} value={opt.value}>
						{opt.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};

export default FilterSelect;
