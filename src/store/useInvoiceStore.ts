import { create } from "zustand";
import type { Invoice } from "@/types/entity";

interface InvoiceState {
	invoices: Invoice[];
	loading: boolean;
	selectedInvoice: Invoice | null;
	recentInvoices: Invoice[];
	setInvoices: (invoices: Invoice[]) => void;
	setLoading: (loading: boolean) => void;
	setSelectedInvoice: (invoice: Invoice | null) => void;
	updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
	deleteInvoice: (id: string) => void;
	addInvoice: (invoice: Invoice) => void;
	getRecentInvoices: (limit?: number) => void;
	getTotalSales: () => number;
	getTotalPurchases: () => number;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
	invoices: [],
	loading: false,
	selectedInvoice: null,
	recentInvoices: [],
	setInvoices: (invoices) => {
		set({ invoices });
		get().getRecentInvoices();
	},
	setLoading: (loading) => set({ loading }),
	setSelectedInvoice: (invoice) => set({ selectedInvoice: invoice }),
	updateInvoice: (id, updatedInvoice) =>
		set((state) => ({
			invoices: state.invoices.map((invoice) => (invoice._id === id ? { ...invoice, ...updatedInvoice } : invoice)),
		})),
	deleteInvoice: (id) =>
		set((state) => ({
			invoices: state.invoices.filter((invoice) => invoice._id !== id),
		})),
	addInvoice: (invoice) =>
		set((state) => ({
			invoices: [invoice, ...state.invoices],
		})),
	getRecentInvoices: (limit = 10) =>
		set((state) => ({
			recentInvoices: state.invoices.slice(0, limit),
		})),
	getTotalSales: () => {
		const { invoices } = get();
		return invoices.filter((inv) => inv.invoiceType === "sale").reduce((sum, inv) => sum + inv.totalAmount, 0);
	},
	getTotalPurchases: () => {
		const { invoices } = get();
		return invoices.filter((inv) => inv.invoiceType === "purchase").reduce((sum, inv) => sum + inv.totalAmount, 0);
	},
}));
