import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePartyStore } from "@/store/usePartyStore";
import type { Party } from "@/types/entity";
import { directApiClient } from "./apiWrapper";

const PARTY_QUERY_KEY = "parties";

export const partyService = {
	getAll: () => directApiClient.get<Party[]>("/parties"),
	getById: (id: string) => directApiClient.get<Party>(`/parties/${id}`),
	create: (party: Omit<Party, "_id" | "createdAt" | "updatedAt" | "transactions">) =>
		directApiClient.post<Party>("/parties", party),
	update: (id: string, party: Partial<Party>) => directApiClient.put<Party>(`/parties/${id}`, party),
	delete: (id: string) => directApiClient.delete(`/parties/${id}`),
};

export const useParties = () => {
	const setParties = usePartyStore((state) => state.setParties);
	const setLoading = usePartyStore((state) => state.setLoading);

	return useQuery({
		queryKey: [PARTY_QUERY_KEY],
		queryFn: async () => {
			setLoading(true);
			try {
				const data = await partyService.getAll();
				setParties(data);
				return data;
			} finally {
				setLoading(false);
			}
		},
	});
};

export const useParty = (id: string) => {
	return useQuery({
		queryKey: [PARTY_QUERY_KEY, id],
		queryFn: () => partyService.getById(id),
		enabled: !!id,
	});
};

export const useCreateParty = () => {
	const queryClient = useQueryClient();
	const addParty = usePartyStore((state) => state.addParty);

	return useMutation({
		mutationFn: partyService.create,
		onSuccess: (data) => {
			addParty(data);
			queryClient.invalidateQueries({ queryKey: [PARTY_QUERY_KEY] });
		},
	});
};

export const useUpdateParty = () => {
	const queryClient = useQueryClient();
	const updateParty = usePartyStore((state) => state.updateParty);

	return useMutation({
		mutationFn: ({ id, party }: { id: string; party: Partial<Party> }) => partyService.update(id, party),
		onSuccess: (data) => {
			updateParty(data._id, data);
			queryClient.invalidateQueries({ queryKey: [PARTY_QUERY_KEY] });
			queryClient.invalidateQueries({ queryKey: [PARTY_QUERY_KEY, data._id] });
		},
	});
};

export const useDeleteParty = () => {
	const queryClient = useQueryClient();
	const deleteParty = usePartyStore((state) => state.deleteParty);

	return useMutation({
		mutationFn: partyService.delete,
		onSuccess: (_, id) => {
			deleteParty(id);
			queryClient.invalidateQueries({ queryKey: [PARTY_QUERY_KEY] });
		},
	});
};
