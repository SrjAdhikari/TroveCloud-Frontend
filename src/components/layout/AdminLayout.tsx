//* src/components/layout/AdminLayout.tsx

import { Outlet } from "react-router";

import {
	Sidebar,
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import ThemeToggle from "@/components/theme/theme-toggle";
import AdminTabs from "@/components/admin/AdminTabs";
import SidebarLogo from "@/components/dashboard/sidebar/SidebarLogo";
import SidebarNav from "@/components/dashboard/sidebar/SidebarNav";
import SidebarUserMenu from "@/components/dashboard/sidebar/SidebarUserMenu";

/**
 * Admin console layout — same sidebar shell as the dashboard (minus the "New" button)
 * plus a fixed header that hosts the Overview / Users tab strip.
 */
const AdminLayout = () => {
	return (
		<SidebarProvider>
			<Sidebar collapsible="offcanvas">
				<SidebarLogo />
				<SidebarNav />
				<SidebarUserMenu />
			</Sidebar>

			<SidebarInset>
				<header className="flex h-14 items-center gap-3 border-b px-4">
					<SidebarTrigger
						variant="outline"
						size="icon"
						className="size-7 lg:hidden"
					/>

					<AdminTabs />

					<div className="flex-1" />

					<ThemeToggle />
				</header>

				<main className="flex-1 overflow-auto p-6">
					<Outlet />
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
};

export default AdminLayout;
