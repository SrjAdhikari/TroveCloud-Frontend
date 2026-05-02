//* src/components/dashboard/sidebar/SidebarLogo.tsx

import {
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

/**
 * Sidebar header showing the TroveCloud logo and brand name.
 * Non-interactive — hover/active backgrounds are disabled.
 */
const SidebarLogo = () => {
	return (
		<SidebarHeader>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton
						size="lg"
						tooltip="TroveCloud"
						className="hover:bg-transparent active:bg-transparent cursor-default"
					>
						<img
							src={`${import.meta.env.BASE_URL}assets/logos/logo.png`}
							alt="TroveCloud"
							className="size-10 shrink-0"
						/>

						<span className="text-2xl font-bold text-foreground">
							TroveCloud
						</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarHeader>
	);
};

export default SidebarLogo;
