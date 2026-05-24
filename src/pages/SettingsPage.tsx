//* src/pages/SettingsPage.tsx

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProfileTab from "@/components/settings/ProfileTab";
import SecurityTab from "@/components/settings/SecurityTab";
import SessionsTab from "@/components/settings/SessionsTab";
import StorageTab from "@/components/settings/StorageTab";
import AccountTab from "@/components/settings/AccountTab";

/**
 * Settings page with vertical sidebar nav and content area.
 * Page layout — left nav, right content.
 * Built on shadcn Tabs (vertical orientation) for keyboard accessibility.
 */
const SettingsPage = () => {
	const tabsClass =
		"cursor-pointer justify-start text-base font-medium rounded-lg px-3 py-2 after:hidden hover:bg-muted/50 data-active:bg-muted! data-active:text-foreground!";

	return (
		<div className="mx-auto max-w-6xl">
			<h1 className="text-xl font-medium mb-6 ml-3">Settings</h1>

			{/* Sidebar nav + content */}
			<Tabs defaultValue="profile" orientation="vertical" className="flex-col">
				<div className="flex gap-10">
					{/* Left nav */}
					<TabsList
						variant="line"
						className="w-48 shrink-0 flex-col items-stretch gap-1.5"
					>
						<TabsTrigger value="profile" className={tabsClass}>
							Profile
						</TabsTrigger>

						<TabsTrigger value="security" className={tabsClass}>
							Security
						</TabsTrigger>

						<TabsTrigger value="sessions" className={tabsClass}>
							Sessions
						</TabsTrigger>

						<TabsTrigger value="storage" className={tabsClass}>
							Storage
						</TabsTrigger>

						<TabsTrigger value="account" className={tabsClass}>
							Account
						</TabsTrigger>
					</TabsList>

					{/* Right content */}
					<div className="flex-1 min-w-0">
						<TabsContent value="profile">
							<ProfileTab />
						</TabsContent>

						<TabsContent value="security">
							<SecurityTab />
						</TabsContent>

						<TabsContent value="sessions">
							<SessionsTab />
						</TabsContent>

						<TabsContent value="storage">
							<StorageTab />
						</TabsContent>

						<TabsContent value="account">
							<AccountTab />
						</TabsContent>
					</div>
				</div>
			</Tabs>
		</div>
	);
};

export default SettingsPage;
