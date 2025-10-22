import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Employee } from "@/types/entity";
import { directApiClient } from "./apiWrapper";

const EMPLOYEE_QUERY_KEY = "employees";

export const employeeService = {
	getAll: () => directApiClient.get<Employee[]>("/employees"),
	getById: (id: string) => directApiClient.get<Employee>(`/employees/${id}`),
	create: (employee: Omit<Employee, "_id" | "createdAt" | "updatedAt">) =>
		directApiClient.post<Employee>("/employees", employee),
	update: (id: string, employee: Partial<Employee>) => directApiClient.put<Employee>(`/employees/${id}`, employee),
	delete: (id: string) => directApiClient.delete(`/employees/${id}`),
};

export const useEmployees = () => {
	return useQuery({
		queryKey: [EMPLOYEE_QUERY_KEY],
		queryFn: () => employeeService.getAll(),
	});
};

export const useEmployee = (id: string) => {
	return useQuery({
		queryKey: [EMPLOYEE_QUERY_KEY, id],
		queryFn: () => employeeService.getById(id),
		enabled: !!id,
	});
};

export const useCreateEmployee = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: employeeService.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [EMPLOYEE_QUERY_KEY] });
		},
	});
};

export const useUpdateEmployee = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, employee }: { id: string; employee: Partial<Employee> }) => employeeService.update(id, employee),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: [EMPLOYEE_QUERY_KEY] });
			queryClient.invalidateQueries({ queryKey: [EMPLOYEE_QUERY_KEY, data._id] });
		},
	});
};

export const useDeleteEmployee = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: employeeService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [EMPLOYEE_QUERY_KEY] });
		},
	});
};
