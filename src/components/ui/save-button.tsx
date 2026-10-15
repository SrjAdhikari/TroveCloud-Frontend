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
 * Save button that shows its own result instead of a toast: saving, then a
 * check mark for 2 seconds, or an error, then back to normal.
 */
const SaveButton = ({
	onSave,
	label = "Save Changes",
	className,
}: SaveButtonProps) => {
	const [state, setState] = useState<State>("idle");
	const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Stop the reset timer if the button goes away mid-way (e.g. the user
	// leaves the page).
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
