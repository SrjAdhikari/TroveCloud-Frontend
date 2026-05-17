//* src/components/admin/StatCard.tsx

import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BreakdownRow {
	label: string;
	value: string;
}

interface StatCardProps {
	label: string;
	icon: LucideIcon;
	breakdown: BreakdownRow[];
}

/**
 * Single admin stat card — icon + label header followed by a uniform list of
 * label/value rows. Every card on a page renders with the same internal
 * structure so the grid reads as a single scannable block.
 */
const StatCard = ({ label, icon: Icon, breakdown }: StatCardProps) => {
	return (
		<Card size="sm" className="bg-background">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
					<Icon aria-hidden="true" className="size-4" strokeWidth={1.75} />
					{label}
				</CardTitle>
			</CardHeader>

			<CardContent>
				<dl className="flex flex-col gap-1 text-sm">
					{breakdown.map((row, index) => (
						<div
							key={`${row.label}-${index}`}
							className="flex justify-between gap-2"
						>
							<dt className="text-muted-foreground">{row.label}</dt>
							<dd className="font-medium text-foreground">{row.value}</dd>
						</div>
					))}
				</dl>
			</CardContent>
		</Card>
	);
};

export default StatCard;
