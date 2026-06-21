//* src/components/dashboard/cards/ItemCardLayout.tsx

import type { ReactNode } from "react";
import { Link, useNavigate, type To } from "react-router";

interface ItemCardLayoutProps {
	view: "grid" | "list";
	icon: ReactNode;
	name: ReactNode;
	actions: ReactNode;
	to?: To;
	onActivate?: () => void;
	modified?: ReactNode;
	size?: ReactNode;
}

const ROW_WRAPPER =
	"col-span-full grid grid-cols-subgrid items-center gap-4 group border-b border-border transition-colors hover:bg-muted";

const ROW_CELLS =
	"col-span-2 md:col-span-3 lg:col-span-4 grid grid-cols-subgrid items-center gap-4 px-4 py-2 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";

const GRID_CARD =
	"group relative cursor-pointer rounded-xl border border-border bg-background p-4 text-left transition-all focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";

const ItemCardLayout = ({
	view,
	icon,
	name,
	actions,
	to,
	onActivate,
	modified,
	size,
}: ItemCardLayoutProps) => {
	const navigate = useNavigate();

	// A card navigates (`to`) or runs an imperative action (`onActivate`)
	const activate = to ? () => navigate(to) : onActivate;

	if (view === "grid") {
		return (
			<div
				role="button"
				tabIndex={0}
				onClick={activate}
				onKeyDown={(e) => {
					// role="button" must honor both Enter and Space
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						activate?.();
					}
				}}
				className={GRID_CARD}
			>
				{/* Action menu — absolute top-right so it doesn't break centering */}
				<div className="absolute right-2 top-2">{actions}</div>

				{/* Icon above the divider */}
				<div className="flex h-24 items-center justify-center">{icon}</div>

				<hr className="my-3 -mx-4 border-border" />

				{/* Name below the divider */}
				{name}
			</div>
		);
	}

	// A variable holding JSX for list view, so we can reuse it for both the <Link> and <button> cases.
	const cells = (
		<>
			<div className="flex size-8 shrink-0 items-center justify-center">
				{icon}
			</div>

			{name}

			<span className="hidden md:block text-sm text-muted-foreground text-center">
				{modified}
			</span>

			<span className="hidden lg:block text-sm text-muted-foreground text-center">
				{size}
			</span>
		</>
	);

	return (
		<div className={ROW_WRAPPER}>
			{to ? (
				<Link to={to} className={ROW_CELLS}>
					{cells}
				</Link>
			) : (
				<button
					type="button"
					onClick={activate}
					className={`${ROW_CELLS} text-left`}
				>
					{cells}
				</button>
			)}

			<div className="flex justify-center">{actions}</div>
		</div>
	);
};

export default ItemCardLayout;
