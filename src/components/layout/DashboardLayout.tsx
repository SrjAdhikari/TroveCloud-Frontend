//* src/components/layout/DashboardLayout.tsx

import { Outlet } from "react-router";
import { Bell } from "lucide-react";

import {
	Sidebar,
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/theme/theme-toggle";
import SearchBar from "@/components/dashboard/SearchBar";
import SidebarLogo from "@/components/dashboard/sidebar/SidebarLogo";
import SidebarNewButton from "@/components/dashboard/sidebar/SidebarNewButton";
import SidebarNav from "@/components/dashboard/sidebar/SidebarNav";
import SidebarUserMenu from "@/components/dashboard/sidebar/SidebarUserMenu";

/**
 * Main dashboard layout — sidebar + content area.
 * Used as a layout route in React Router — pages render via <Outlet />.
 * On mobile, the sidebar collapses into a slide-out sheet.
 * On desktop, the sidebar is always visible (non-collapsible).
 */
const DashboardLayout = () => {
	return (
		<SidebarProvider>
			<Sidebar collapsible="offcanvas">
				<SidebarLogo />
				<SidebarNewButton />
				<SidebarNav />
				<SidebarUserMenu />
			</Sidebar>

			{/* Main content area */}
			<SidebarInset>
				{/* Top header bar */}
				<header className="flex h-14 items-center gap-3 border-b px-4">
					<SidebarTrigger
						variant="outline"
						size="icon"
						className="size-7 lg:hidden"
					/>
					<div className="flex-1 lg:hidden" />
					<SearchBar />
					<div className="flex-1" />

					<Button
						type="button"
						variant="outline"
						size="icon"
						className="size-7 focus-visible:ring-0"
						aria-label="Notifications"
					>
						<Bell className="size-4" />
					</Button>

					<ThemeToggle />
				</header>

				{/* Page content */}
				<div className="flex-1 overflow-auto p-6">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
};

export default DashboardLayout;
