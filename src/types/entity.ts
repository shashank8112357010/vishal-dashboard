import type { NavItemDataProps } from "@/components/nav/types";
import type { BasicStatus, PermissionType } from "./enum";

export interface UserToken {
	accessToken?: string;
	refreshToken?: string;
}

export interface UserInfo {
	id: string;
	email: string;
	username: string;
	password?: string;
	avatar?: string;
	roles?: Role[];
	status?: BasicStatus;
	permissions?: Permission[];
	menu?: MenuTree[];
}

export interface Permission_Old {
	id: string;
	parentId: string;
	name: string;
	label: string;
	type: PermissionType;
	route: string;
	status?: BasicStatus;
	order?: number;
	icon?: string;
	component?: string;
	hide?: boolean;
	hideTab?: boolean;
	frameSrc?: URL;
	newFeature?: boolean;
	children?: Permission_Old[];
}

export interface Role_Old {
	id: string;
	name: string;
	code: string;
	status: BasicStatus;
	order?: number;
	desc?: string;
	permission?: Permission_Old[];
}

export interface CommonOptions {
	status?: BasicStatus;
	desc?: string;
	createdAt?: string;
	updatedAt?: string;
}
export interface User extends CommonOptions {
	id: string; // uuid
	username: string;
	password: string;
	email: string;
	phone?: string;
	avatar?: string;
}

export interface Role extends CommonOptions {
	id: string; // uuid
	name: string;
	code: string;
}

export interface Permission extends CommonOptions {
	id: string; // uuid
	name: string;
	code: string; // resource:action  example: "user-management:read"
}

export interface Menu extends CommonOptions, MenuMetaInfo {
	id: string; // uuid
	parentId: string;
	name: string;
	code: string;
	order?: number;
	type: PermissionType;
}

export type MenuMetaInfo = Partial<
	Pick<NavItemDataProps, "path" | "icon" | "caption" | "info" | "disabled" | "auth" | "hidden">
> & {
	externalLink?: URL;
	component?: string;
};

export type MenuTree = Menu & {
	children?: MenuTree[];
};

// Bicycle Shop Types
export interface Party {
	_id: string;
	partyName: string;
	partyType: "creditor" | "debtor";
	phoneNumber: string;
	state: string;
	city: string;
	gstNumber?: string;
	address: string;
	balanceAmount: number;
	transactions: string[];
	createdAt: string;
	updatedAt: string;
}

export interface InventoryItem {
	_id: string;
	itemName: string;
	category: "bicycle" | "spare_part";
	unitType: "piece" | "set" | "pair" | "dozen" | "packet";
	bundleCount: number;
	quantityAvailable: number;
	stockType: "loose" | "fitted";
	purchasePrice: number;
	sellingPrice: number;
	lastBorrowedDate?: string;
	partyId?: string;
	createdAt: string;
	updatedAt: string;
}

export interface InvoiceItem {
	itemId: string | InventoryItem;
	quantity: number;
	pricePerUnit: number;
	totalAmount: number;
}

export interface Invoice {
	_id: string;
	invoiceNumber: string;
	date: string;
	partyId: string | Party;
	items: InvoiceItem[];
	invoiceType: "purchase" | "sale";
	paymentStatus: "pending" | "partial" | "paid";
	totalAmount: number;
	balanceAmount: number;
	notes?: string;
	createdAt: string;
	updatedAt: string;
}

export interface StockHistory {
	_id: string;
	itemId: string;
	change: number;
	reason: string;
	previousQty: number;
	newQty: number;
	date: string;
	createdAt: string;
	updatedAt: string;
}

// Employee Management Types
export interface Employee {
	_id: string;
	employeeId: string;
	name: string;
	email: string;
	phoneNumber: string;
	address: string;
	dateOfJoining: string;
	position: string;
	department: string;
	salary: number;
	status: "active" | "inactive" | "on_leave";
	createdAt: string;
	updatedAt: string;
}

export interface Attendance {
	_id: string;
	employeeId: string | Employee;
	date: string;
	checkIn: string;
	checkOut?: string;
	status: "present" | "absent" | "half_day" | "on_leave";
	workHours?: number;
	notes?: string;
	createdAt: string;
	updatedAt: string;
}

export interface Payroll {
	_id: string;
	employeeId: string | Employee;
	month: number;
	year: number;
	baseSalary: number;
	allowances: number;
	deductions: number;
	bonus: number;
	netSalary: number;
	workingDays: number;
	presentDays: number;
	paidDays: number;
	paymentStatus: "pending" | "paid";
	paymentDate?: string;
	notes?: string;
	createdAt: string;
	updatedAt: string;
}

export interface PermissionModule {
	module: string;
	canView: boolean;
	canCreate: boolean;
	canEdit: boolean;
	canDelete: boolean;
}

export interface RolePermission {
	_id: string;
	role: "sales" | "manager" | "admin";
	permissions: PermissionModule[];
	createdAt: string;
	updatedAt: string;
}
