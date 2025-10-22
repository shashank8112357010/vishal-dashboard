import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import type { Invoice } from "@/types/entity";
import { directApiClient } from "./apiWrapper";

const INVOICE_QUERY_KEY = "invoices";

export const invoiceService = {
	getAll: () => directApiClient.get<Invoice[]>("/invoices"),
	getById: (id: string) => directApiClient.get<Invoice>(`/invoices/${id}`),
	create: (invoice: Omit<Invoice, "_id" | "createdAt" | "updatedAt">) =>
		directApiClient.post<Invoice>("/invoices", invoice),
	update: (id: string, invoice: Partial<Invoice>) => directApiClient.put<Invoice>(`/invoices/${id}`, invoice),
	delete: (id: string) => directApiClient.delete(`/invoices/${id}`),
};

export const useInvoices = () => {
	const setInvoices = useInvoiceStore((state) => state.setInvoices);
	const setLoading = useInvoiceStore((state) => state.setLoading);

	return useQuery({
		queryKey: [INVOICE_QUERY_KEY],
		queryFn: async () => {
			setLoading(true);
			try {
				const data = await invoiceService.getAll();
				setInvoices(data);
				return data;
			} finally {
				setLoading(false);
			}
		},
	});
};

export const useInvoice = (id: string) => {
	return useQuery({
		queryKey: [INVOICE_QUERY_KEY, id],
		queryFn: () => invoiceService.getById(id),
		enabled: !!id,
	});
};

export const useCreateInvoice = () => {
	const queryClient = useQueryClient();
	const addInvoice = useInvoiceStore((state) => state.addInvoice);

	return useMutation({
		mutationFn: invoiceService.create,
		onSuccess: (data) => {
			addInvoice(data);
			// Invalidate all related queries
			queryClient.invalidateQueries({ queryKey: [INVOICE_QUERY_KEY] });
			queryClient.invalidateQueries({ queryKey: ["inventory"] });
			queryClient.invalidateQueries({ queryKey: ["parties"] });
		},
	});
};

export const useUpdateInvoice = () => {
	const queryClient = useQueryClient();
	const updateInvoice = useInvoiceStore((state) => state.updateInvoice);

	return useMutation({
		mutationFn: ({ id, invoice }: { id: string; invoice: Partial<Invoice> }) => invoiceService.update(id, invoice),
		onSuccess: (data) => {
			updateInvoice(data._id, data);
			// Invalidate all related queries
			queryClient.invalidateQueries({ queryKey: [INVOICE_QUERY_KEY] });
			queryClient.invalidateQueries({ queryKey: [INVOICE_QUERY_KEY, data._id] });
			queryClient.invalidateQueries({ queryKey: ["inventory"] });
			queryClient.invalidateQueries({ queryKey: ["parties"] });
		},
	});
};

export const useDeleteInvoice = () => {
	const queryClient = useQueryClient();
	const deleteInvoice = useInvoiceStore((state) => state.deleteInvoice);

	return useMutation({
		mutationFn: invoiceService.delete,
		onSuccess: (_, id) => {
			deleteInvoice(id);
			// Invalidate all related queries
			queryClient.invalidateQueries({ queryKey: [INVOICE_QUERY_KEY] });
			queryClient.invalidateQueries({ queryKey: ["inventory"] });
			queryClient.invalidateQueries({ queryKey: ["parties"] });
		},
	});
};
