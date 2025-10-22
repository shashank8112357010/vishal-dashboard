import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LedgerEntry, LedgerSummary } from "@/types/entity";
import { directApiClient } from "./apiWrapper";

const LEDGER_QUERY_KEY = "ledger";

export const ledgerService = {
	getAll: (params?: {
		transactionType?: "receivable" | "payable";
		status?: "pending" | "partial" | "settled";
		partyId?: string;
		customerId?: string;
	}) => {
		const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : "";
		return directApiClient.get<LedgerEntry[]>(`/ledger${queryString}`);
	},
	getSummary: () => directApiClient.get<LedgerSummary>("/ledger/summary"),
	getById: (id: string) => directApiClient.get<LedgerEntry>(`/ledger/${id}`),
	create: (ledgerEntry: Omit<LedgerEntry, "_id" | "createdAt" | "updatedAt" | "settlements">) =>
		directApiClient.post<LedgerEntry>("/ledger", ledgerEntry),
	addSettlement: (id: string, settlement: { amount: number; mode: "cash" | "online" | "both"; notes?: string }) =>
		directApiClient.post<LedgerEntry>(`/ledger/${id}/settlement`, settlement),
	delete: (id: string) => directApiClient.delete(`/ledger/${id}`),
};

export const useLedgerEntries = (params?: {
	transactionType?: "receivable" | "payable";
	status?: "pending" | "partial" | "settled";
	partyId?: string;
	customerId?: string;
}) => {
	return useQuery({
		queryKey: [LEDGER_QUERY_KEY, params],
		queryFn: () => ledgerService.getAll(params),
	});
};

export const useLedgerSummary = () => {
	return useQuery({
		queryKey: [LEDGER_QUERY_KEY, "summary"],
		queryFn: () => ledgerService.getSummary(),
	});
};

export const useLedgerEntry = (id: string) => {
	return useQuery({
		queryKey: [LEDGER_QUERY_KEY, id],
		queryFn: () => ledgerService.getById(id),
		enabled: !!id,
	});
};

export const useCreateLedgerEntry = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ledgerService.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [LEDGER_QUERY_KEY] });
		},
	});
};

export const useAddSettlement = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, settlement }: { id: string; settlement: any }) => ledgerService.addSettlement(id, settlement),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [LEDGER_QUERY_KEY] });
		},
	});
};

export const useDeleteLedgerEntry = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ledgerService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [LEDGER_QUERY_KEY] });
		},
	});
};
