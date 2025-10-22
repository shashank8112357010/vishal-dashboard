import { create } from "zustand";
import type { InventoryItem } from "@/types/entity";

interface InventoryState {
	items: InventoryItem[];
	loading: boolean;
	selectedItem: InventoryItem | null;
	lowStockItems: InventoryItem[];
	setItems: (items: InventoryItem[]) => void;
	setLoading: (loading: boolean) => void;
	setSelectedItem: (item: InventoryItem | null) => void;
	updateItem: (id: string, item: Partial<InventoryItem>) => void;
	deleteItem: (id: string) => void;
	addItem: (item: InventoryItem) => void;
	adjustStock: (id: string, adjustment: number) => void;
	getLowStockItems: () => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
	items: [],
	loading: false,
	selectedItem: null,
	lowStockItems: [],
	setItems: (items) => {
		set({ items });
		get().getLowStockItems();
	},
	setLoading: (loading) => set({ loading }),
	setSelectedItem: (item) => set({ selectedItem: item }),
	updateItem: (id, updatedItem) =>
		set((state) => {
			const newItems = state.items.map((item) => (item._id === id ? { ...item, ...updatedItem } : item));
			return { items: newItems };
		}),
	deleteItem: (id) =>
		set((state) => ({
			items: state.items.filter((item) => item._id !== id),
		})),
	addItem: (item) =>
		set((state) => ({
			items: [...state.items, item],
		})),
	adjustStock: (id, adjustment) =>
		set((state) => ({
			items: state.items.map((item) =>
				item._id === id ? { ...item, quantityAvailable: item.quantityAvailable + adjustment } : item,
			),
		})),
	getLowStockItems: () =>
		set((state) => ({
			lowStockItems: state.items.filter((item) => item.quantityAvailable < 10),
		})),
}));
