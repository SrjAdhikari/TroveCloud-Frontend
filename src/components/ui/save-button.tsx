//* src/components/ui/save-button.tsx

import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import cn from "@/lib/utils";

type State = "idle" | "saving" | "saved" | "error";

interface SaveButtonProps {
	onSave: () => Promise<void>;
	label?: string;
	className?: string;
}

/**
 * Stateful save button that confirms its action through its own UI states instead of a toast.
 * Cycles: idle → saving → saved (✓ for 2s) → idle, or idle → saving → error → idle.
 */
const SaveButton = ({
	onSave,
	label = "Save Changes",
	className,
}: SaveButtonProps) => {
	const [state, setState] = useState<State>("idle");
	const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Cancel any pending state-reset timer if the button unmounts mid-cycle
	// (e.g., user navigates away during the saved/error display window).
	useEffect(() => {
		return () => {
			if (resetTimer.current !== null) {
				clearTimeout(resetTimer.current);
			}
		};
	}, []);

	const handleClick = async () => {
		if (resetTimer.current !== null) {
			clearTimeout(resetTimer.current);
			resetTimer.current = null;
		}

		setState("saving");
		try {
			await onSave();
			setState("saved");
			resetTimer.current = setTimeout(() => setState("idle"), 2000);
		} catch {
			setState("error");
			resetTimer.current = setTimeout(() => setState("idle"), 3000);
		}
	};

	return (
		<Button
			type="button"
			onClick={handleClick}
			disabled={state === "saving" || state === "saved"}
			className={cn(
				"bg-purple hover:bg-purple-hover text-white",
				"disabled:opacity-60 disabled:pointer-events-auto disabled:cursor-not-allowed",
				className,
			)}
		>
			{state === "saving" && <Loader2 size={16} className="animate-spin" />}
			{state === "saved" && <Check size={16} className="text-success" />}

			{state === "idle" && label}
			{state === "saving" && "Saving..."}
			{state === "saved" && "Saved"}
			{state === "error" && "Failed — Try Again"}
		</Button>
	);
};

export default SaveButton;
