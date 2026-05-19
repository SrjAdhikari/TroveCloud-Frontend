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

interface FilterSelectProps<T extends string> {
	value: T | undefined;
	onChange: (value: T | undefined) => void;
	allLabel: string;
	options: ReadonlyArray<FilterSelectOption<T>>;
	className?: string;
}

// Radix Select rejects an empty-string value, so we map the unfiltered state
// (`undefined`) to a unique sentinel for the "All" item.
const ALL = "__all__";

/**
 * Generic select dropdown for filtering by a single value from a list. 
 * The "All" option is represented by `value` being `undefined`, and is 
 * always present as the first item in the list with the label from `allLabel`.
 */
const FilterSelect = <T extends string>({
	value,
	onChange,
	allLabel,
	options,
	className,
}: FilterSelectProps<T>) => (
	<Select
		value={value ?? ALL}
		onValueChange={(v) => onChange(v === ALL ? undefined : (v as T))}
	>
		<SelectTrigger className={cn("w-full", className)}>
			<SelectValue />
		</SelectTrigger>

		<SelectContent>
			<SelectItem value={ALL}>{allLabel}</SelectItem>
			{options.map((opt) => (
				<SelectItem key={opt.value} value={opt.value}>
					{opt.label}
				</SelectItem>
			))}
		</SelectContent>
	</Select>
);

export default FilterSelect;
