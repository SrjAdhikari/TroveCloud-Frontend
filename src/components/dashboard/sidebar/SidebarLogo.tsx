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
							src="/assets/logos/logo.png"
							alt="TroveCloud"
							className="size-7 shrink-0"
						/>

						<span className="text-xl font-semibold text-[#7C3AED] dark:text-[#8B5CF6]">
							TroveCloud
						</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarHeader>
	);
};

export default SidebarLogo;
