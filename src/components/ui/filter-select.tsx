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
	options: ReadonlyArray<FilterSelectOption<T>>;
	className?: string;
}

// Discriminated union on `allLabel`: when present, undefined is a valid value
// (mapped to the "All" row); when absent, the pick is required.
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

// Radix Select rejects an empty-string value, so we map the unfiltered state
// (`undefined`) to a unique sentinel for the "All" item.
const ALL = "__all__";

/**
 * Select over `{ value, label }` options. Pass `allLabel` for filter UX (adds
 * an "All" row that emits `undefined`); omit it for required-pick UX.
 */
const FilterSelect = <T extends string>({
	value,
	onChange,
	allLabel,
	options,
	className,
}: FilterSelectProps<T>) => {
	// Explicit undefined check — `""` is a valid allLabel string and must
	// route through the filter branch, not the required-pick branch.
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
			<SelectTrigger className={cn("w-full", className)}>
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
