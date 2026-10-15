//* src/components/ui/alert-banner.tsx

import type { ReactNode } from "react";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

import cn from "@/lib/utils";

type Variant = "error" | "warning" | "info";

interface AlertBannerProps {
	variant: Variant;
	children: ReactNode;
	className?: string;
	id?: string;
}

const variantStyles: Record<Variant, string> = {
	error: "bg-danger/8 border-danger/30 text-danger",
	warning: "bg-warning/8 border-warning/30 text-warning",
	info: "bg-purple/8 border-purple/30 text-purple",
};

const variantIcons: Record<Variant, ReactNode> = {
	error: <AlertCircle size={16} className="shrink-0 mt-0.5" />,
	warning: <AlertTriangle size={16} className="shrink-0 mt-0.5" />,
	info: <Info size={16} className="shrink-0 mt-0.5" />,
};

const variantRoles: Record<Variant, "alert" | "status"> = {
	error: "alert",
	warning: "status",
	info: "status",
};

/**
 * Colored banner for messages about the whole form, not one field, e.g.
 * wrong password or account locked. Usually placed above the form.
 */
const AlertBanner = ({ variant, children, className, id }: AlertBannerProps) => (
	<div
		id={id}
		role={variantRoles[variant]}
		className={cn(
			"flex items-start gap-3 p-3 rounded-lg border text-sm",
			variantStyles[variant],
			className,
		)}
	>
		{variantIcons[variant]}
		<div className="flex-1">{children}</div>
	</div>
);

export default AlertBanner;
