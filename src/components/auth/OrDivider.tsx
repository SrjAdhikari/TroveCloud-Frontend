//* src/components/auth/OrDivider.tsx

interface OrDividerProps {
	label: string;
}

/** A line with a label in the middle, like "Or continue with email". */
const OrDivider = ({ label }: OrDividerProps) => (
	<div className="relative">
		<div aria-hidden="true" className="absolute inset-0 flex items-center">
			<div className="w-full border-t border-border" />
		</div>
		<div className="relative flex justify-center">
			<span className="bg-background px-2 text-sm tracking-wider text-muted-foreground">
				{label}
			</span>
		</div>
	</div>
);

export default OrDivider;
