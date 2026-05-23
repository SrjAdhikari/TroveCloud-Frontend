//* src/components/ui/sonner.tsx

import type { ComponentProps } from "react";
import { Toaster as Sonner } from "sonner";

import useTheme from "@/hooks/useTheme";

type ToasterProps = ComponentProps<typeof Sonner>;

/**
 * TroveCloud-themed Sonner Toaster. Reads the active theme from the
 * useTheme hook so toasts visually match the app's light/dark mode.
 * Variant tints use semantic tokens so both modes work automatically.
 */
const Toaster = ({
	toastOptions: callerToastOptions,
	...restProps
}: ToasterProps) => {
	const { theme } = useTheme();

	return (
		<Sonner
			{...restProps}
			theme={theme}
			position="bottom-right"
			gap={8}
			visibleToasts={3}
			closeButton
			toastOptions={{
				...callerToastOptions,
				classNames: {
					toast:
						"group flex items-start gap-3 w-full rounded-xl border px-4 py-3 text-sm shadow-[0_8px_32px_rgba(0,0,0,0.4)] bg-card border-border text-foreground",
					title: "font-medium text-foreground text-sm",
					description: "text-muted-foreground text-xs mt-0.5",
					actionButton:
						"inline-flex items-center px-2.5 py-1 rounded-md bg-purple text-white text-xs font-medium hover:bg-purple-hover transition-colors ml-auto shrink-0",
					cancelButton:
						"inline-flex items-center px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium hover:bg-muted transition-colors",
					closeButton:
						"text-muted-foreground hover:text-foreground transition-colors opacity-60 hover:opacity-100",
					success: "border-success/25 bg-success/5",
					error: "border-danger/25 bg-danger/5",
					warning: "border-warning/25 bg-warning/5",
					info: "border-purple/25 bg-purple/5",
					...callerToastOptions?.classNames,
				},
			}}
		/>
	);
};

export default Toaster;
