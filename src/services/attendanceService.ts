import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Attendance } from "@/types/entity";
import { directApiClient } from "./apiWrapper";

const ATTENDANCE_QUERY_KEY = "attendance";

export const attendanceService = {
	getAll: (params?: { employeeId?: string; startDate?: string; endDate?: string }) => {
		const queryString = params
			? `?${Object.entries(params)
					.filter(([_, value]) => value)
					.map(([key, value]) => `${key}=${value}`)
					.join("&")}`
			: "";
		return directApiClient.get<Attendance[]>(`/attendance${queryString}`);
	},
	getById: (id: string) => directApiClient.get<Attendance>(`/attendance/${id}`),
	create: (attendance: Omit<Attendance, "_id" | "createdAt" | "updatedAt">) =>
		directApiClient.post<Attendance>("/attendance", attendance),
	update: (id: string, attendance: Partial<Attendance>) =>
		directApiClient.put<Attendance>(`/attendance/${id}`, attendance),
	delete: (id: string) => directApiClient.delete(`/attendance/${id}`),
};

export const useAttendance = (params?: { employeeId?: string; startDate?: string; endDate?: string }) => {
	return useQuery({
		queryKey: [ATTENDANCE_QUERY_KEY, params],
		queryFn: () => attendanceService.getAll(params),
	});
};

export const useAttendanceRecord = (id: string) => {
	return useQuery({
		queryKey: [ATTENDANCE_QUERY_KEY, id],
		queryFn: () => attendanceService.getById(id),
		enabled: !!id,
	});
};

export const useCreateAttendance = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: attendanceService.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [ATTENDANCE_QUERY_KEY] });
		},
	});
};

export const useUpdateAttendance = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, attendance }: { id: string; attendance: Partial<Attendance> }) =>
			attendanceService.update(id, attendance),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: [ATTENDANCE_QUERY_KEY] });
			queryClient.invalidateQueries({ queryKey: [ATTENDANCE_QUERY_KEY, data._id] });
		},
	});
};

export const useDeleteAttendance = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: attendanceService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [ATTENDANCE_QUERY_KEY] });
		},
	});
};
