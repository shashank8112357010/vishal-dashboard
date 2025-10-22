import { useCallback, useEffect, useMemo, useState } from "react";
import { useBoolean } from "react-use";
import { Icon } from "@/components/icon";
import useLocale from "@/locales/use-locale";
import { useRouter } from "@/routes/hooks";
import { useCustomers } from "@/services/customerService";
import { useEmployees } from "@/services/employeeService";
import { useInventory } from "@/services/inventoryService";
import { useInvoices } from "@/services/invoiceService";
import { useParties } from "@/services/partyService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandSeparator } from "@/ui/command";
import { ScrollArea } from "@/ui/scroll-area";
import { Text } from "@/ui/typography";
import { useFilteredNavData } from "../dashboard/nav";

interface SearchItem {
	key: string;
	label: string;
	path: string;
	subtitle?: string;
	type: "navigation" | "party" | "customer" | "inventory" | "invoice" | "employee";
	searchableText: string; // Combined text for comprehensive search
}

// 高亮文本组件
const HighlightText = ({ text, query }: { text: string; query: string }) => {
	if (!query) return <>{text}</>;

	const parts = text.split(new RegExp(`(${query})`, "gi"));

	return (
		<>
			{parts.map((part, i) =>
				part.toLowerCase() === query.toLowerCase() ? (
					// biome-ignore lint/suspicious/noArrayIndexKey: index is stable for highlighting
					<span key={i} className="text-primary">
						{part}
					</span>
				) : (
					part
				),
			)}
		</>
	);
};

const SearchBar = () => {
	const { t } = useLocale();
	const { replace } = useRouter();
	const [open, setOpen] = useBoolean(false);
	const [searchQuery, setSearchQuery] = useState("");
	const navData = useFilteredNavData();

	// Fetch all data for global search
	const { data: parties = [] } = useParties();
	const { data: customers = [] } = useCustomers();
	const { data: inventory = [] } = useInventory();
	const { data: invoices = [] } = useInvoices();
	const { data: employees = [] } = useEmployees();

	// Flatten navigation data into searchable items
	const allSearchableItems = useMemo(() => {
		const items: SearchItem[] = [];

		// Navigation items
		const flattenNav = (navItems: typeof navData) => {
			for (const section of navItems) {
				for (const item of section.items) {
					if (item.path) {
						items.push({
							key: `nav-${item.path}`,
							label: item.title,
							path: item.path,
							type: "navigation",
							searchableText: `${item.title} ${item.path}`,
						});
					}
					if (item.children) {
						flattenNav([{ items: item.children }]);
					}
				}
			}
		};
		flattenNav(navData);

		// Parties - Search by name, phone, GST, address, city, state, type
		for (const party of parties) {
			const searchableText = [
				party.partyName,
				party.phoneNumber,
				party.gstNumber,
				party.address,
				party.city,
				party.state,
				party.partyType,
				party._id,
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();

			items.push({
				key: `party-${party._id}`,
				label: party.partyName,
				subtitle: `${party.phoneNumber} • ${party.partyType}${party.gstNumber ? ` • ${party.gstNumber}` : ""}`,
				path: `/bicycle-shop/parties`,
				type: "party",
				searchableText,
			});
		}

		// Customers - Search by name, phone, email, address
		for (const customer of customers) {
			const searchableText = [customer.customerName, customer.phone, customer.email, customer.address, customer._id]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();

			items.push({
				key: `customer-${customer._id}`,
				label: customer.customerName,
				subtitle: `${customer.phone}${customer.email ? ` • ${customer.email}` : ""}`,
				path: `/bicycle-shop/customers/${customer._id}`,
				type: "customer",
				searchableText,
			});
		}

		// Inventory - Search by name, category, stock type
		for (const item of inventory) {
			const searchableText = [item.itemName, item.category, item.stockType, item.unitType, item._id]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();

			items.push({
				key: `inventory-${item._id}`,
				label: item.itemName,
				subtitle: `${item.category} • ${item.quantityAvailable} ${item.unitType} available`,
				path: `/bicycle-shop/inventory`,
				type: "inventory",
				searchableText,
			});
		}

		// Invoices - Search by invoice number, party name, type, amount
		for (const invoice of invoices) {
			const partyName = typeof invoice.partyId === "string" ? "" : invoice.partyId?.partyName || "";
			const searchableText = [
				invoice.invoiceNumber,
				partyName,
				invoice.invoiceType,
				invoice.totalAmount.toString(),
				invoice.paymentStatus,
				invoice._id,
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();

			items.push({
				key: `invoice-${invoice._id}`,
				label: invoice.invoiceNumber,
				subtitle: `${partyName} • ${invoice.invoiceType} • ₹${invoice.totalAmount}`,
				path: `/bicycle-shop/invoices`,
				type: "invoice",
				searchableText,
			});
		}

		// Employees - Search by name, email, phone, position, department, employee ID
		for (const employee of employees) {
			const searchableText = [
				employee.name,
				employee.email,
				employee.phoneNumber,
				employee.position,
				employee.department,
				employee.employeeId,
				employee._id,
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();

			items.push({
				key: `employee-${employee._id}`,
				label: employee.name,
				subtitle: `${employee.phoneNumber} • ${employee.position} • ${employee.department}`,
				path: `/bicycle-shop/employees`,
				type: "employee",
				searchableText,
			});
		}

		return items;
	}, [navData, parties, customers, inventory, invoices, employees]);

	// Filter items based on search query - searches ALL fields
	const searchResults = useMemo(() => {
		if (!searchQuery) return allSearchableItems;

		const query = searchQuery.toLowerCase();
		return allSearchableItems.filter((item) => {
			// Search in comprehensive searchableText field (includes all data)
			return item.searchableText.includes(query);
		});
	}, [searchQuery, allSearchableItems]);

	// Group results by type
	const groupedResults = useMemo(() => {
		const groups: Record<string, SearchItem[]> = {
			navigation: [],
			party: [],
			customer: [],
			inventory: [],
			invoice: [],
			employee: [],
		};

		for (const item of searchResults) {
			groups[item.type].push(item);
		}

		return groups;
	}, [searchResults]);

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open: boolean) => !open);
			}
		};

		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, [setOpen]);

	const handleSelect = useCallback(
		(path: string) => {
			replace(path);
			setOpen(false);
		},
		[replace, setOpen],
	);

	return (
		<>
			<Button variant="ghost" className="bg-action-selected px-2 rounded-lg" size="sm" onClick={() => setOpen(true)}>
				<div className="flex items-center justify-center gap-4">
					<Icon icon="local:ic-search" size="20" />
					<kbd className="flex items-center justify-center rounded-md bg-primary/80 text-common-white px-1.5 py-0.5 text-sm font-semibold">
						<Icon icon="qlementine-icons:key-cmd-16" />
						<span>K</span>
					</kbd>
				</div>
			</Button>

			<CommandDialog open={open} onOpenChange={setOpen}>
				<CommandInput placeholder="Type a command or search..." value={searchQuery} onValueChange={setSearchQuery} />
				<ScrollArea className="h-[400px]">
					<CommandEmpty>No results found.</CommandEmpty>

					{groupedResults.navigation.length > 0 && (
						<CommandGroup heading="Navigations">
							{groupedResults.navigation.map(({ key, label, path }) => (
								<CommandItem key={key} onSelect={() => handleSelect(path)} className="flex flex-col items-start">
									<div className="font-medium">
										<HighlightText text={t(label)} query={searchQuery} />
									</div>
									<div className="text-xs text-muted-foreground">
										<HighlightText text={path} query={searchQuery} />
									</div>
								</CommandItem>
							))}
						</CommandGroup>
					)}

					{groupedResults.party.length > 0 && (
						<CommandGroup heading="Parties">
							{groupedResults.party.map(({ key, label, subtitle, path }) => (
								<CommandItem key={key} onSelect={() => handleSelect(path)} className="flex flex-col items-start">
									<div className="font-medium">
										<HighlightText text={label} query={searchQuery} />
									</div>
									{subtitle && (
										<div className="text-xs text-muted-foreground">
											<HighlightText text={subtitle} query={searchQuery} />
										</div>
									)}
								</CommandItem>
							))}
						</CommandGroup>
					)}

					{groupedResults.customer.length > 0 && (
						<CommandGroup heading="Customers">
							{groupedResults.customer.map(({ key, label, subtitle, path }) => (
								<CommandItem key={key} onSelect={() => handleSelect(path)} className="flex flex-col items-start">
									<div className="font-medium">
										<HighlightText text={label} query={searchQuery} />
									</div>
									{subtitle && (
										<div className="text-xs text-muted-foreground">
											<HighlightText text={subtitle} query={searchQuery} />
										</div>
									)}
								</CommandItem>
							))}
						</CommandGroup>
					)}

					{groupedResults.inventory.length > 0 && (
						<CommandGroup heading="Inventory">
							{groupedResults.inventory.map(({ key, label, subtitle, path }) => (
								<CommandItem key={key} onSelect={() => handleSelect(path)} className="flex flex-col items-start">
									<div className="font-medium">
										<HighlightText text={label} query={searchQuery} />
									</div>
									{subtitle && (
										<div className="text-xs text-muted-foreground">
											<HighlightText text={subtitle} query={searchQuery} />
										</div>
									)}
								</CommandItem>
							))}
						</CommandGroup>
					)}

					{groupedResults.invoice.length > 0 && (
						<CommandGroup heading="Invoices">
							{groupedResults.invoice.map(({ key, label, subtitle, path }) => (
								<CommandItem key={key} onSelect={() => handleSelect(path)} className="flex flex-col items-start">
									<div className="font-medium">
										<HighlightText text={label} query={searchQuery} />
									</div>
									{subtitle && (
										<div className="text-xs text-muted-foreground">
											<HighlightText text={subtitle} query={searchQuery} />
										</div>
									)}
								</CommandItem>
							))}
						</CommandGroup>
					)}

					{groupedResults.employee.length > 0 && (
						<CommandGroup heading="Employees">
							{groupedResults.employee.map(({ key, label, subtitle, path }) => (
								<CommandItem key={key} onSelect={() => handleSelect(path)} className="flex flex-col items-start">
									<div className="font-medium">
										<HighlightText text={label} query={searchQuery} />
									</div>
									{subtitle && (
										<div className="text-xs text-muted-foreground">
											<HighlightText text={subtitle} query={searchQuery} />
										</div>
									)}
								</CommandItem>
							))}
						</CommandGroup>
					)}
				</ScrollArea>
				<CommandSeparator />
				<div className="flex flex-wrap text-text-primary p-2 justify-end gap-2">
					<div className="flex items-center gap-1">
						<Badge variant="info">↑</Badge>
						<Badge variant="info">↓</Badge>
						<Text variant="caption">to navigate</Text>
					</div>
					<div className="flex items-center gap-1">
						<Badge variant="info">↵</Badge>
						<Text variant="caption">to select</Text>
					</div>
					<div className="flex items-center gap-1">
						<Badge variant="info">ESC</Badge>
						<Text variant="caption">to close</Text>
					</div>
				</div>
			</CommandDialog>
		</>
	);
};

export default SearchBar;
