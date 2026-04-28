//* src/components/layout/AuthLayout.tsx

import type { ReactNode } from "react";
import { Outlet } from "react-router";
import {
	CloudDownload,
	FolderTree,
	MonitorSmartphone,
	Share2,
} from "lucide-react";

interface Feature {
	icon: ReactNode;
	title: string;
	description: string;
}

const FEATURES: Feature[] = [
	{
		icon: <MonitorSmartphone className="size-5" />,
		title: "Your files, always within reach",
		description:
			"Any browser, any device — your folders open exactly as you left them.",
	},
	{
		icon: <FolderTree className="size-5" />,
		title: "Store, organize, and access from anywhere",
		description:
			"Build the folder structure that fits your work. Files stay in their original format.",
	},
	{
		icon: <CloudDownload className="size-5" />,
		title: "Bring your Google Drive in",
		description:
			"Skip re-uploading. We pull files straight from Drive — folder structure intact.",
	},
	{
		icon: <Share2 className="size-5" />,
		title: "Share with anyone, anywhere",
		description: "Share files with anyone — you control who can access them.",
	},
];

/**
 * Split-screen layout for all auth pages (login, register, forgot password, verify OTP).
 * Left panel shows branding, tagline, and feature cards.
 * Right panel renders the matched child route via <Outlet />.
 * On viewports below `lg` the left panel is hidden so forms get the full width.
 */
const AuthLayout = () => {
	return (
		<div className="flex min-h-screen bg-background">
			{/* Left panel — branding + features (hidden on mobile) */}
			<aside className="hidden lg:flex lg:w-1/2 flex-col p-5 xl:p-8 bg-sidebar relative overflow-hidden isolate">
				{/* Subtle purple glow — centered horizontally, slightly below vertical center */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute top-[55%] left-1/2 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple/15 blur-3xl -z-10"
				/>

				<div className="flex items-center gap-2">
					<img
						src={`${import.meta.env.BASE_URL}assets/logos/logo.png`}
						alt="TroveCloud"
						className="size-10 shrink-0"
					/>
					<span className="text-2xl font-bold text-foreground">TroveCloud</span>
				</div>

				<div className="flex flex-1 flex-col justify-center max-w-lg mx-auto w-full xl:gap-10">
					<h1 className="sr-only xl:not-sr-only text-2xl xl:text-3xl font-bold text-foreground leading-tight">
						Organize your files the way you want to
					</h1>

					<ul className="space-y-7">
						{FEATURES.map((feature) => (
							<li
								key={feature.title}
								className="flex gap-3 p-4 rounded-xl border border-border"
							>
								<div className="shrink-0 size-9 rounded-lg bg-purple/10 text-purple flex items-center justify-center">
									{feature.icon}
								</div>
								<div className="space-y-1">
									<h3 className="font-medium text-foreground">
										{feature.title}
									</h3>
									<p className="text-sm text-muted-foreground leading-relaxed">
										{feature.description}
									</p>
								</div>
							</li>
						))}
					</ul>
				</div>
			</aside>

			{/* Right panel — form content */}
			<main className="relative flex flex-1 items-center justify-center p-6">
				<div className="w-full max-w-md">
					<Outlet />
				</div>
			</main>
		</div>
	);
};

export default AuthLayout;
