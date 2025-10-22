import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Customer, CustomerProfile } from "@/types/entity";
import { directApiClient } from "./apiWrapper";

const CUSTOMER_QUERY_KEY = "customers";

export const customerService = {
	getAll: () => directApiClient.get<Customer[]>("/customers"),
	getById: (id: string) => directApiClient.get<Customer>(`/customers/${id}`),
	getProfile: (id: string) => directApiClient.get<CustomerProfile>(`/customers/${id}/profile`),
	search: (query: string) => directApiClient.get<Customer[]>(`/customers/search?query=${query}`),
	create: (customer: Omit<Customer, "_id" | "createdAt" | "updatedAt">) =>
		directApiClient.post<Customer>("/customers", customer),
	update: (id: string, customer: Partial<Customer>) => directApiClient.put<Customer>(`/customers/${id}`, customer),
	delete: (id: string) => directApiClient.delete(`/customers/${id}`),
};

export const useCustomers = () => {
	return useQuery({
		queryKey: [CUSTOMER_QUERY_KEY],
		queryFn: customerService.getAll,
	});
};

export const useCustomer = (id: string) => {
	return useQuery({
		queryKey: [CUSTOMER_QUERY_KEY, id],
		queryFn: () => customerService.getById(id),
		enabled: !!id,
	});
};

export const useCustomerProfile = (id: string) => {
	return useQuery({
		queryKey: [CUSTOMER_QUERY_KEY, id, "profile"],
		queryFn: () => customerService.getProfile(id),
		enabled: !!id,
	});
};

export const useSearchCustomers = (query: string) => {
	return useQuery({
		queryKey: [CUSTOMER_QUERY_KEY, "search", query],
		queryFn: () => customerService.search(query),
		enabled: query.length > 0,
	});
};

export const useCreateCustomer = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: customerService.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [CUSTOMER_QUERY_KEY] });
		},
	});
};

export const useUpdateCustomer = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, customer }: { id: string; customer: Partial<Customer> }) => customerService.update(id, customer),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: [CUSTOMER_QUERY_KEY] });
			queryClient.invalidateQueries({ queryKey: [CUSTOMER_QUERY_KEY, variables.id] });
			queryClient.invalidateQueries({ queryKey: [CUSTOMER_QUERY_KEY, variables.id, "profile"] });
		},
	});
};

export const useDeleteCustomer = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: customerService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [CUSTOMER_QUERY_KEY] });
		},
	});
};
