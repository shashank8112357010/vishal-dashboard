import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RolePermission } from "@/types/entity";
import { directApiClient } from "./apiWrapper";

const ROLE_PERMISSION_QUERY_KEY = "rolePermissions";

export const rolePermissionService = {
	getAll: () => directApiClient.get<RolePermission[]>("/role-permissions"),
	getByRole: (role: string) => directApiClient.get<RolePermission>(`/role-permissions/${role}`),
	createOrUpdate: (rolePermission: Omit<RolePermission, "_id" | "createdAt" | "updatedAt">) =>
		directApiClient.post<RolePermission>("/role-permissions", rolePermission),
	delete: (role: string) => directApiClient.delete(`/role-permissions/${role}`),
};

export const useRolePermissions = () => {
	return useQuery({
		queryKey: [ROLE_PERMISSION_QUERY_KEY],
		queryFn: () => rolePermissionService.getAll(),
	});
};

export const useRolePermission = (role: string) => {
	return useQuery({
		queryKey: [ROLE_PERMISSION_QUERY_KEY, role],
		queryFn: () => rolePermissionService.getByRole(role),
		enabled: !!role,
	});
};

export const useCreateOrUpdateRolePermission = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: rolePermissionService.createOrUpdate,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: [ROLE_PERMISSION_QUERY_KEY] });
			queryClient.invalidateQueries({ queryKey: [ROLE_PERMISSION_QUERY_KEY, data.role] });
		},
	});
};

export const useDeleteRolePermission = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: rolePermissionService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [ROLE_PERMISSION_QUERY_KEY] });
		},
	});
};
