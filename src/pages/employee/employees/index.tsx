import { Modal, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type React from "react";
import { useState } from "react";
import { Icon } from "@/components/icon";
import EmployeeForm from "@/components/Employee/EmployeeForm";
import { useDeleteEmployee, useEmployees } from "@/services/employeeService";
import type { Employee } from "@/types/entity";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Input } from "@/ui/input";
import { formatCurrency } from "@/utils/format-number";

const EmployeesPage: React.FC = () => {
	const [searchText, setSearchText] = useState("");
	const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
	const [isFormVisible, setIsFormVisible] = useState(false);

	const { data: employees = [], isLoading } = useEmployees();
	const deleteMutation = useDeleteEmployee();

	const handleDelete = (id: string) => {
		Modal.confirm({
			title: "Delete Employee",
			content: "Are you sure you want to delete this employee? This action cannot be undone.",
			onOk: async () => {
				try {
					await deleteMutation.mutateAsync(id);
					message.success("Employee deleted successfully");
				} catch (_error) {
					message.error("Failed to delete employee");
				}
			},
		});
	};

	const handleEdit = (employee: Employee) => {
		setEditingEmployee(employee);
		setIsFormVisible(true);
	};

	const handleAdd = () => {
		setEditingEmployee(null);
		setIsFormVisible(true);
	};

	const handleFormClose = () => {
		setEditingEmployee(null);
		setIsFormVisible(false);
	};

	const filteredEmployees = employees.filter(
		(employee) =>
			employee.name?.toLowerCase().includes(searchText.toLowerCase()) ||
			employee.employeeId?.toLowerCase().includes(searchText.toLowerCase()) ||
			employee.department?.toLowerCase().includes(searchText.toLowerCase()) ||
			employee.position?.toLowerCase().includes(searchText.toLowerCase()),
	);

	const columns: ColumnsType<Employee> = [
		{
			title: "Employee ID",
			dataIndex: "employeeId",
			key: "employeeId",
			sorter: (a: Employee, b: Employee) => (a.employeeId || "").localeCompare(b.employeeId || ""),
		},
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
			sorter: (a: Employee, b: Employee) => (a.name || "").localeCompare(b.name || ""),
		},
		{
			title: "Email",
			dataIndex: "email",
			key: "email",
		},
		{
			title: "Phone",
			dataIndex: "phoneNumber",
			key: "phoneNumber",
		},
		{
			title: "Department",
			dataIndex: "department",
			key: "department",
		},
		{
			title: "Position",
			dataIndex: "position",
			key: "position",
		},
		{
			title: "Date of Joining",
			dataIndex: "dateOfJoining",
			key: "dateOfJoining",
			render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
			sorter: (a: Employee, b: Employee) => dayjs(a.dateOfJoining).unix() - dayjs(b.dateOfJoining).unix(),
		},
		{
			title: "Salary",
			dataIndex: "salary",
			key: "salary",
			render: (amount: number) => formatCurrency(amount),
			sorter: (a: Employee, b: Employee) => (a.salary || 0) - (b.salary || 0),
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status: string) => {
				const variantMap: Record<string, "default" | "secondary" | "destructive"> = {
					active: "default",
					inactive: "destructive",
					on_leave: "secondary",
				};
				return <Badge variant={variantMap[status] || "default"}>{status?.toUpperCase().replace("_", " ")}</Badge>;
			},
		},
		{
			title: "Action",
			key: "operation",
			align: "center",
			width: 100,
			render: (_, record: Employee) => (
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
							<h2 className="text-2xl font-bold">Employee Management</h2>
							<p className="text-muted-foreground">Manage employee information and records</p>
						</div>
						<Button onClick={handleAdd}>
							<Icon icon="solar:add-circle-bold-duotone" size={18} className="mr-2" />
							Add Employee
						</Button>
					</div>
					<div className="flex items-center gap-4 pt-4">
						<Input
							placeholder="Search by name, ID, department, or position"
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							className="max-w-md"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<Table
						rowKey="_id"
						size="small"
						scroll={{ x: 1400 }}
						pagination={{
							defaultPageSize: 10,
							showSizeChanger: true,
							showTotal: (total) => `Total ${total} employees`,
						}}
						columns={columns}
						dataSource={filteredEmployees}
						loading={isLoading}
					/>
				</CardContent>
			</Card>
			<EmployeeForm visible={isFormVisible} employee={editingEmployee} onClose={handleFormClose} />
		</>
	);
};

export default EmployeesPage;
