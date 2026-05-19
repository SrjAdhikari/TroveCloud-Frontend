//* src/components/admin/ProviderIcon.tsx

import { Mail } from "lucide-react";

import GitHubIcon from "@/components/icons/GitHubIcon";
import GoogleIcon from "@/components/icons/GoogleIcon";
import cn from "@/lib/utils";
import type { AuthProvider } from "@/types/admin.types";

interface ProviderIconProps {
	provider: AuthProvider;
	className?: string;
}

const LABEL_MAP: Record<AuthProvider, string> = {
	email: "Email",
	google: "Google",
	github: "GitHub",
};

/**
 * Small glyph identifying a user's sign-up method. Google keeps its 4-color
 * brand mark; GitHub and email render in `text-foreground` / `text-muted-foreground` 
 * so they adapt to the surrounding theme. The provider label is exposed to assistive 
 * tech via `sr-only` + `title` for hover tooltips.
 */
const ProviderIcon = ({ provider, className }: ProviderIconProps) => {
	const label = LABEL_MAP[provider];

	return (
		<span
			title={label}
			className={cn(
				"inline-flex items-center justify-center",
				provider === "github" && "text-foreground",
				provider === "email" && "text-muted-foreground",
				className,
			)}
		>
			<span className="sr-only">{label}</span>
			{provider === "google" && <GoogleIcon className="size-4" aria-hidden="true" />}
			{provider === "github" && <GitHubIcon className="size-4" aria-hidden="true" />}
			{provider === "email" && <Mail className="size-4" aria-hidden="true" />}
		</span>
	);
};

export default ProviderIcon;
