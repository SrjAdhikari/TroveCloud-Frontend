//* src/components/dashboard/sidebar/SidebarNav.tsx

import { useNavigate, useLocation } from "react-router";
import {
	FolderClosed,
	Share2,
	Heart,
	Trash2,
	type LucideIcon,
} from "lucide-react";

import {
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavItem {
	label: string;
	icon: LucideIcon;
	path?: string;
	disabled?: boolean;
}

const navItems: NavItem[] = [
	{ label: "My Files", icon: FolderClosed, path: "/my-files" },
	{ label: "Shared", icon: Share2, path: "/shared" },
	{ label: "Favorites", icon: Heart, path: "/favorites" },
	{ label: "Trash", icon: Trash2, path: "/trash" },
];

/**
 * Sidebar navigation links for the dashboard.
 * Active item is determined by the current route path.
 * Disabled items are dimmed placeholders for features not yet supported.
 */
const SidebarNav = () => {
	const navigate = useNavigate();
	const location = useLocation();

	return (
		<SidebarContent>
			<SidebarGroup>
				<SidebarGroupLabel>Browse</SidebarGroupLabel>

				<SidebarGroupContent>
					<SidebarMenu>
						{navItems.map((item) => {
							const isActive = item.path
								? location.pathname === item.path ||
									location.pathname.startsWith(`${item.path}/`)
								: false;
							return (
								<SidebarMenuItem key={item.label}>
									<SidebarMenuButton
										isActive={isActive}
										aria-current={isActive ? "page" : undefined}
										tooltip={item.label}
										disabled={item.disabled}
										className="h-10 pl-3"
										onClick={() => item.path && navigate(item.path)}
									>
										<item.icon />
										<span>{item.label}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							);
						})}
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		</SidebarContent>
	);
};

export default SidebarNav;
