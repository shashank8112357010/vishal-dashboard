import { Icon } from "@/components/icon";
import type { NavProps } from "@/components/nav";

export const frontendNavData: NavProps["data"] = [
	{
		name: "sys.nav.dashboard",
		items: [
			{
				title: "sys.nav.workbench",
				path: "/workbench",
				icon: <Icon icon="local:ic-workbench" size="24" />,
			},
			{
				title: "sys.nav.analysis",
				path: "/analysis",
				icon: <Icon icon="local:ic-analysis" size="24" />,
			},
		],
	},
	{
		name: "Bicycle Shop",
		items: [
			{
				title: "Parties",
				path: "/bicycle-shop/parties",
				icon: <Icon icon="solar:users-group-rounded-bold-duotone" size="24" />,
			},
			{
				title: "Inventory",
				path: "/bicycle-shop/inventory",
				icon: <Icon icon="solar:box-bold-duotone" size="24" />,
			},
			{
				title: "Invoices",
				path: "/bicycle-shop/invoices",
				icon: <Icon icon="solar:document-text-bold-duotone" size="24" />,
			},
		],
	},
];
