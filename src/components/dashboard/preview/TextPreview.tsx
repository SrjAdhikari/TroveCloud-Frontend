//* src/components/dashboard/preview/TextPreview.tsx

import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";

import axiosClient from "@/config/axiosClient";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface TextPreviewProps {
	url: string;
}

/**
 * Fetches and displays file content as plain text in a scrollable code block.
 * Shows a loading spinner while fetching and an error message on failure.
 */
const TextPreview = ({ url }: TextPreviewProps) => {
	const [content, setContent] = useState<string | null>(null);
	const [error, setError] = useState(false);
	const [copied, setCopied] = useState(false);

	/** Fetch file content as plain text on mount */
	useEffect(() => {
		axiosClient
			.get(url, { responseType: "text" })
			.then((res) => setContent(res.data))
			.catch(() => setError(true));
	}, [url]);

	if (error) {
		return (
			<div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
				Failed to load file content
			</div>
		);
	}

	if (content === null) {
		return (
			<div className="flex items-center justify-center py-8">
				<LoadingSpinner className="size-5" />
			</div>
		);
	}

	return (
		<div className="max-h-[55vh] sm:max-h-[65vh] lg:max-h-[75vh] overflow-auto rounded-xl bg-card">
			{/* Header: traffic light dots + copy button */}
			<div className="sticky top-0 flex items-center justify-between bg-muted px-5 pt-4 pb-2">
				<div className="flex gap-2">
					<span className="size-3 rounded-full bg-destructive" />
					<span className="size-3 rounded-full bg-chart-3" />
					<span className="size-3 rounded-full bg-chart-2" />
				</div>

				<button
					onClick={() => {
						navigator.clipboard.writeText(content);
						setCopied(true);
						setTimeout(() => setCopied(false), 2000);
					}}
					className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors hover:bg-foreground/10 cursor-pointer"
				>
					{copied ? (
						<>
							<Check className="size-3.5 text-success" />
							Copied
						</>
					) : (
						<>
							<Copy className="size-3.5" />
							Copy
						</>
					)}
				</button>
			</div>

			<pre className="px-5 pb-5 font-mono text-sm leading-relaxed text-secondary-foreground">
				<code>{content}</code>
			</pre>
		</div>
	);
};

export default TextPreview;
