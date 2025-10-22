import { DatePicker, Modal, Select, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type React from "react";
import { useState } from "react";
import { Icon } from "@/components/icon";
import AttendanceForm from "@/components/Employee/AttendanceForm";
import { useEmployees } from "@/services/employeeService";
import { useAttendance, useDeleteAttendance } from "@/services/attendanceService";
import type { Attendance, Employee } from "@/types/entity";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";

const { RangePicker } = DatePicker;
const { Option } = Select;

const AttendancePage: React.FC = () => {
	const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
	const [isFormVisible, setIsFormVisible] = useState(false);
	const [selectedEmployee, setSelectedEmployee] = useState<string | undefined>(undefined);
	const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

	const { data: employees = [] } = useEmployees();
	const { data: attendanceRecords = [], isLoading } = useAttendance({
		employeeId: selectedEmployee,
		startDate: dateRange?.[0]?.toISOString(),
		endDate: dateRange?.[1]?.toISOString(),
	});
	const deleteMutation = useDeleteAttendance();

	const handleDelete = (id: string) => {
		Modal.confirm({
			title: "Delete Attendance",
			content: "Are you sure you want to delete this attendance record?",
			onOk: async () => {
				try {
					await deleteMutation.mutateAsync(id);
					message.success("Attendance record deleted successfully");
				} catch (_error) {
					message.error("Failed to delete attendance record");
				}
			},
		});
	};

	const handleEdit = (attendance: Attendance) => {
		setEditingAttendance(attendance);
		setIsFormVisible(true);
	};

	const handleAdd = () => {
		setEditingAttendance(null);
		setIsFormVisible(true);
	};

	const handleFormClose = () => {
		setEditingAttendance(null);
		setIsFormVisible(false);
	};

	const columns: ColumnsType<Attendance> = [
		{
			title: "Employee",
			dataIndex: "employeeId",
			key: "employeeId",
			render: (emp: string | Employee) => {
				if (typeof emp === "string") return emp;
				return (
					<div>
						<div className="font-medium">{emp.name}</div>
						<div className="text-sm text-gray-500">{emp.employeeId}</div>
					</div>
				);
			},
		},
		{
			title: "Date",
			dataIndex: "date",
			key: "date",
			render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
			sorter: (a: Attendance, b: Attendance) => dayjs(a.date).unix() - dayjs(b.date).unix(),
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status: string) => {
				const variantMap: Record<string, "default" | "secondary" | "destructive"> = {
					present: "default",
					absent: "destructive",
					half_day: "secondary",
					on_leave: "secondary",
				};
				return <Badge variant={variantMap[status] || "default"}>{status?.toUpperCase().replace("_", " ")}</Badge>;
			},
		},
		{
			title: "Check In",
			dataIndex: "checkIn",
			key: "checkIn",
			render: (time: string) => (time ? dayjs(time).format("HH:mm") : "-"),
		},
		{
			title: "Check Out",
			dataIndex: "checkOut",
			key: "checkOut",
			render: (time: string) => (time ? dayjs(time).format("HH:mm") : "-"),
		},
		{
			title: "Work Hours",
			dataIndex: "workHours",
			key: "workHours",
			render: (hours: number) => (hours ? `${hours.toFixed(2)} hrs` : "-"),
			sorter: (a: Attendance, b: Attendance) => (a.workHours || 0) - (b.workHours || 0),
		},
		{
			title: "Notes",
			dataIndex: "notes",
			key: "notes",
			render: (notes: string) => notes || "-",
		},
		{
			title: "Action",
			key: "operation",
			align: "center",
			width: 100,
			render: (_, record: Attendance) => (
				<div className="flex w-full justify-center text-gray-500">
					<Button variant="ghost" size="icon" onClick={() => handleEdit(record)}>
						<Icon icon="solar:pen-bold-duotone" size={18} />
					</Button>
					<Button variant="ghost" size="icon" onClick={() => handleDelete(record._id)}>
						<Icon icon="mingcute:delete-2-fill" size={18} className="text-red-500" />
					</Button>
				</div>
			),
		},
	];

	return (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-2xl font-bold">Attendance Management</h2>
							<p className="text-muted-foreground">Track employee attendance and work hours</p>
						</div>
						<Button onClick={handleAdd}>
							<Icon icon="solar:add-circle-bold-duotone" size={18} className="mr-2" />
							Mark Attendance
						</Button>
					</div>
					<div className="flex flex-wrap items-center gap-4 pt-4">
						<Select
							placeholder="Filter by employee"
							className="w-64"
							allowClear
							showSearch
							filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
							onChange={(value) => setSelectedEmployee(value)}
						>
							{employees.map((emp) => (
								<Option key={emp._id} value={emp._id}>
									{emp.name} ({emp.employeeId})
								</Option>
							))}
						</Select>
						<RangePicker format="DD/MM/YYYY" onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])} />
					</div>
				</CardHeader>
				<CardContent>
					<Table
						rowKey="_id"
						size="small"
						scroll={{ x: 1200 }}
						pagination={{
							defaultPageSize: 10,
							showSizeChanger: true,
							showTotal: (total) => `Total ${total} records`,
						}}
						columns={columns}
						dataSource={attendanceRecords}
						loading={isLoading}
					/>
				</CardContent>
			</Card>
			<AttendanceForm visible={isFormVisible} attendance={editingAttendance} onClose={handleFormClose} />
		</>
	);
};

export default AttendancePage;
