//* src/components/admin/UsersPagination.tsx

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UsersPaginationProps {
	page: number;
	totalPages: number;
	onPrev: () => void;
	onNext: () => void;
}

const UsersPagination = ({
	page,
	totalPages,
	onPrev,
	onNext,
}: UsersPaginationProps) => {
	const prevRef = useRef<HTMLButtonElement>(null);
	const nextRef = useRef<HTMLButtonElement>(null);

	const handlePrev = () => {
		if (page === 2) nextRef.current?.focus();
		onPrev();
	};

	const handleNext = () => {
		if (page === totalPages - 1) prevRef.current?.focus();
		onNext();
	};

	return (
		<nav
			aria-label="Pagination"
			className="flex items-center justify-between gap-3 pt-2"
		>
			<Button
				ref={prevRef}
				variant="outline"
				size="sm"
				onClick={handlePrev}
				disabled={page <= 1}
			>
				<ChevronLeft className="size-4" aria-hidden="true" />
				Prev
			</Button>

			<span className="text-sm text-muted-foreground">
				Page {page} of {totalPages}
			</span>

			<Button
				ref={nextRef}
				variant="outline"
				size="sm"
				onClick={handleNext}
				disabled={page >= totalPages}
			>
				Next
				<ChevronRight className="size-4" aria-hidden="true" />
			</Button>
		</nav>
	);
};

export default UsersPagination;
