//* src/components/layout/AuthLayout.tsx

import { Outlet } from "react-router";
import { Cloud } from "lucide-react";
import ThemeToggle from "@/components/theme/theme-toggle";

/**
 * Shared split-screen layout for all auth pages (login, register, verify OTP).
 * Left panel shows branding and illustration, right panel renders the matched child route.
 * Used as a layout route in React Router — pages render via <Outlet />.
 * On mobile, only the right panel (form) is shown.
 */
const AuthLayout = () => {
	return (
		<div className="flex min-h-screen flex-col bg-background">
			{/* Header */}
			<header className="flex items-center justify-between px-6 py-3 border-b border-accent">
				<div className="flex items-center gap-2">
					<Cloud className="size-8 text-blue-500" />
					<span className="text-blue-500 text-xl font-semibold">
						TroveCloud
					</span>
				</div>
				<ThemeToggle />
			</header>

			{/* Main content */}
			<main className="flex flex-1 items-center justify-center">
				<section className="hidden w-1/2 items-center justify-center p-10 lg:flex xl:w-2/5">
					{/* Left panel — branding + illustration (hidden on mobile) */}
					<div className="flex max-h-[800px] max-w-[450px] flex-col items-center justify-center space-y-15">
						<div className="space-y-5 text-center">
							<h1 className="text-3xl font-bold tracking-wide text-secondary-foreground">
								Your files, always within reach
							</h1>
							<p className="text-base leading-6 text-muted-foreground">
								A secure cloud space to store, organize,
								<br />
								and access your documents from anywhere.
							</p>
						</div>

						<img
							src="/assets/images/files.png"
							alt="Cloud storage illustration"
							className="w-72"
						/>
					</div>
				</section>

				{/* Right panel — form content */}
				<section className="flex flex-1 flex-col items-center p-4 py-10 lg:justify-center lg:p-10 lg:py-0">
					<Outlet />
				</section>
			</main>
		</div>
	);
};

export default AuthLayout;
