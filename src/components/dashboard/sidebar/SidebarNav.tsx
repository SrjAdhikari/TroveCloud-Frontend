//* src/components/dashboard/sidebar/SidebarNav.tsx

import {
	FolderClosed,
	Share2,
	UsersRound,
	Star,
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
	active?: boolean;
	disabled?: boolean;
}

const navItems: NavItem[] = [
	{ label: "My Files", icon: FolderClosed, active: true },
	{ label: "Shared", icon: Share2 },
	{ label: "Shared with me", icon: UsersRound },
	{ label: "Starred", icon: Star },
	{ label: "Trash", icon: Trash2 },
];

/**
 * Sidebar navigation links for the dashboard.
 * Active items are highlighted, disabled items are dimmed placeholders
 * for features that will be implemented when the backend supports them.
 */
const SidebarNav = () => {
	return (
		<SidebarContent>
			<SidebarGroup>
				<SidebarGroupLabel>Browse</SidebarGroupLabel>

				<SidebarGroupContent>
					<SidebarMenu>
						{navItems.map((item) => (
							<SidebarMenuItem key={item.label}>
								<SidebarMenuButton
									isActive={item.active}
									tooltip={item.label}
									disabled={item.disabled}
									className="h-9"
								>
									<item.icon />
									<span>{item.label}</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		</SidebarContent>
	);
};

export default SidebarNav;
