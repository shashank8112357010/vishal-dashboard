import { InputNumber, Modal, Select, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type React from "react";
import { useState } from "react";
import { Icon } from "@/components/icon";
import PayrollForm from "@/components/Employee/PayrollForm";
import { useEmployees } from "@/services/employeeService";
import { useDeletePayroll, usePayrolls } from "@/services/payrollService";
import type { Employee, Payroll } from "@/types/entity";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { formatCurrency } from "@/utils/format-number";

const { Option } = Select;

const PayrollPage: React.FC = () => {
	const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null);
	const [isFormVisible, setIsFormVisible] = useState(false);
	const [selectedEmployee, setSelectedEmployee] = useState<string | undefined>(undefined);
	const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
	const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);

	const { data: employees = [] } = useEmployees();
	const { data: payrolls = [], isLoading } = usePayrolls({
		employeeId: selectedEmployee,
		month: selectedMonth,
		year: selectedYear,
	});
	const deleteMutation = useDeletePayroll();

	const handleDelete = (id: string) => {
		Modal.confirm({
			title: "Delete Payroll",
			content: "Are you sure you want to delete this payroll record?",
			onOk: async () => {
				try {
					await deleteMutation.mutateAsync(id);
					message.success("Payroll record deleted successfully");
				} catch (_error) {
					message.error("Failed to delete payroll record");
				}
			},
		});
	};

	const handleEdit = (payroll: Payroll) => {
		setEditingPayroll(payroll);
		setIsFormVisible(true);
	};

	const handleAdd = () => {
		setEditingPayroll(null);
		setIsFormVisible(true);
	};

	const handleFormClose = () => {
		setEditingPayroll(null);
		setIsFormVisible(false);
	};

	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	const columns: ColumnsType<Payroll> = [
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
			title: "Period",
			key: "period",
			render: (_, record: Payroll) => `${months[record.month - 1]} ${record.year}`,
			sorter: (a: Payroll, b: Payroll) => a.year * 12 + a.month - (b.year * 12 + b.month),
		},
		{
			title: "Base Salary",
			dataIndex: "baseSalary",
			key: "baseSalary",
			render: (amount: number) => formatCurrency(amount),
		},
		{
			title: "Allowances",
			dataIndex: "allowances",
			key: "allowances",
			render: (amount: number) => formatCurrency(amount),
		},
		{
			title: "Deductions",
			dataIndex: "deductions",
			key: "deductions",
			render: (amount: number) => formatCurrency(amount),
		},
		{
			title: "Bonus",
			dataIndex: "bonus",
			key: "bonus",
			render: (amount: number) => formatCurrency(amount),
		},
		{
			title: "Net Salary",
			dataIndex: "netSalary",
			key: "netSalary",
			render: (amount: number) => <span className="font-semibold">{formatCurrency(amount)}</span>,
			sorter: (a: Payroll, b: Payroll) => a.netSalary - b.netSalary,
		},
		{
			title: "Days",
			key: "days",
			render: (_, record: Payroll) => (
				<div className="text-sm">
					<div>Working: {record.workingDays}</div>
					<div>Present: {record.presentDays}</div>
					<div>Paid: {record.paidDays}</div>
				</div>
			),
		},
		{
			title: "Payment Status",
			dataIndex: "paymentStatus",
			key: "paymentStatus",
			render: (status: string) => (
				<Badge variant={status === "paid" ? "default" : "secondary"}>{status?.toUpperCase()}</Badge>
			),
		},
		{
			title: "Payment Date",
			dataIndex: "paymentDate",
			key: "paymentDate",
			render: (date: string) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
		},
		{
			title: "Action",
			key: "operation",
			align: "center",
			width: 100,
			render: (_, record: Payroll) => (
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
							<h2 className="text-2xl font-bold">Payroll Management</h2>
							<p className="text-muted-foreground">Manage employee salaries and payments</p>
						</div>
						<Button onClick={handleAdd}>
							<Icon icon="solar:add-circle-bold-duotone" size={18} className="mr-2" />
							Create Payroll
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
						<Select
							placeholder="Filter by month"
							className="w-40"
							allowClear
							onChange={(value) => setSelectedMonth(value)}
						>
							{months.map((month, index) => (
								<Option key={month} value={index + 1}>
									{month}
								</Option>
							))}
						</Select>
						<InputNumber
							placeholder="Filter by year"
							className="w-32"
							min={2000}
							max={2100}
							onChange={(value) => setSelectedYear(value || undefined)}
						/>
					</div>
				</CardHeader>
				<CardContent>
					<Table
						rowKey="_id"
						size="small"
						scroll={{ x: 1600 }}
						pagination={{
							defaultPageSize: 10,
							showSizeChanger: true,
							showTotal: (total) => `Total ${total} records`,
						}}
						columns={columns}
						dataSource={payrolls}
						loading={isLoading}
					/>
				</CardContent>
			</Card>
			<PayrollForm visible={isFormVisible} payroll={editingPayroll} onClose={handleFormClose} />
		</>
	);
};

export default PayrollPage;
