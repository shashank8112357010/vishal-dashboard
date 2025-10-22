import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useInventoryStore } from "@/store/useInventoryStore";
import type { InventoryItem } from "@/types/entity";
import { directApiClient } from "./apiWrapper";

const INVENTORY_QUERY_KEY = "inventory";

interface AdjustStockRequest {
	itemId: string;
	adjustment: number;
	reason: string;
}

export const inventoryService = {
	getAll: () => directApiClient.get<InventoryItem[]>("/inventory"),
	getById: (id: string) => directApiClient.get<InventoryItem>(`/inventory/${id}`),
	create: (item: Omit<InventoryItem, "_id" | "createdAt" | "updatedAt">) =>
		directApiClient.post<InventoryItem>("/inventory", item),
	update: (id: string, item: Partial<InventoryItem>) => directApiClient.put<InventoryItem>(`/inventory/${id}`, item),
	delete: (id: string) => directApiClient.delete(`/inventory/${id}`),
	adjustStock: (data: AdjustStockRequest) => directApiClient.post<InventoryItem>("/inventory/adjust", data),
};

export const useInventory = () => {
	const setItems = useInventoryStore((state) => state.setItems);
	const setLoading = useInventoryStore((state) => state.setLoading);

	return useQuery({
		queryKey: [INVENTORY_QUERY_KEY],
		queryFn: async () => {
			setLoading(true);
			try {
				const data = await inventoryService.getAll();
				setItems(data);
				return data;
			} finally {
				setLoading(false);
			}
		},
	});
};

export const useInventoryItem = (id: string) => {
	return useQuery({
		queryKey: [INVENTORY_QUERY_KEY, id],
		queryFn: () => inventoryService.getById(id),
		enabled: !!id,
	});
};

export const useCreateInventory = () => {
	const queryClient = useQueryClient();
	const addItem = useInventoryStore((state) => state.addItem);

	return useMutation({
		mutationFn: inventoryService.create,
		onSuccess: (data) => {
			addItem(data);
			queryClient.invalidateQueries({ queryKey: [INVENTORY_QUERY_KEY] });
		},
	});
};

export const useUpdateInventory = () => {
	const queryClient = useQueryClient();
	const updateItem = useInventoryStore((state) => state.updateItem);

	return useMutation({
		mutationFn: ({ id, item }: { id: string; item: Partial<InventoryItem> }) => inventoryService.update(id, item),
		onSuccess: (data) => {
			updateItem(data._id, data);
			queryClient.invalidateQueries({ queryKey: [INVENTORY_QUERY_KEY] });
			queryClient.invalidateQueries({ queryKey: [INVENTORY_QUERY_KEY, data._id] });
		},
	});
};

export const useDeleteInventory = () => {
	const queryClient = useQueryClient();
	const deleteItem = useInventoryStore((state) => state.deleteItem);

	return useMutation({
		mutationFn: inventoryService.delete,
		onSuccess: (_, id) => {
			deleteItem(id);
			queryClient.invalidateQueries({ queryKey: [INVENTORY_QUERY_KEY] });
		},
	});
};

export const useAdjustStock = () => {
	const queryClient = useQueryClient();
	const updateItem = useInventoryStore((state) => state.updateItem);

	return useMutation({
		mutationFn: inventoryService.adjustStock,
		onSuccess: (data) => {
			updateItem(data._id, data);
			queryClient.invalidateQueries({ queryKey: [INVENTORY_QUERY_KEY] });
			queryClient.invalidateQueries({ queryKey: ["invoices"] }); // Also refresh invoices as they might be affected
		},
	});
};
