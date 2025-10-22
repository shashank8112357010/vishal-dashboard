import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Payroll } from "@/types/entity";
import { directApiClient } from "./apiWrapper";

const PAYROLL_QUERY_KEY = "payroll";

export const payrollService = {
	getAll: (params?: { employeeId?: string; month?: number; year?: number }) => {
		const queryString = params
			? `?${Object.entries(params)
					.filter(([_, value]) => value !== undefined)
					.map(([key, value]) => `${key}=${value}`)
					.join("&")}`
			: "";
		return directApiClient.get<Payroll[]>(`/payroll${queryString}`);
	},
	getById: (id: string) => directApiClient.get<Payroll>(`/payroll/${id}`),
	create: (payroll: Omit<Payroll, "_id" | "createdAt" | "updatedAt" | "netSalary">) =>
		directApiClient.post<Payroll>("/payroll", payroll),
	update: (id: string, payroll: Partial<Payroll>) => directApiClient.put<Payroll>(`/payroll/${id}`, payroll),
	delete: (id: string) => directApiClient.delete(`/payroll/${id}`),
};

export const usePayrolls = (params?: { employeeId?: string; month?: number; year?: number }) => {
	return useQuery({
		queryKey: [PAYROLL_QUERY_KEY, params],
		queryFn: () => payrollService.getAll(params),
	});
};

export const usePayroll = (id: string) => {
	return useQuery({
		queryKey: [PAYROLL_QUERY_KEY, id],
		queryFn: () => payrollService.getById(id),
		enabled: !!id,
	});
};

export const useCreatePayroll = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: payrollService.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [PAYROLL_QUERY_KEY] });
		},
	});
};

export const useUpdatePayroll = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payroll }: { id: string; payroll: Partial<Payroll> }) => payrollService.update(id, payroll),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: [PAYROLL_QUERY_KEY] });
			queryClient.invalidateQueries({ queryKey: [PAYROLL_QUERY_KEY, data._id] });
		},
	});
};

export const useDeletePayroll = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: payrollService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [PAYROLL_QUERY_KEY] });
		},
	});
};
