import { create } from "zustand";
import type { Party } from "@/types/entity";

interface PartyState {
	parties: Party[];
	loading: boolean;
	selectedParty: Party | null;
	setParties: (parties: Party[]) => void;
	setLoading: (loading: boolean) => void;
	setSelectedParty: (party: Party | null) => void;
	updateParty: (id: string, party: Partial<Party>) => void;
	deleteParty: (id: string) => void;
	addParty: (party: Party) => void;
}

export const usePartyStore = create<PartyState>((set) => ({
	parties: [],
	loading: false,
	selectedParty: null,
	setParties: (parties) => set({ parties }),
	setLoading: (loading) => set({ loading }),
	setSelectedParty: (party) => set({ selectedParty: party }),
	updateParty: (id, updatedParty) =>
		set((state) => ({
			parties: state.parties.map((party) => (party._id === id ? { ...party, ...updatedParty } : party)),
		})),
	deleteParty: (id) =>
		set((state) => ({
			parties: state.parties.filter((party) => party._id !== id),
		})),
	addParty: (party) =>
		set((state) => ({
			parties: [...state.parties, party],
		})),
}));
