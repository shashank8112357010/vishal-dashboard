import { DatePicker, Form, Input, InputNumber, Modal, Select, message, Alert, Spin } from "antd";
import dayjs from "dayjs";
import type React from "react";
import { useEffect, useState } from "react";
import { useEmployees } from "@/services/employeeService";
import { useCreatePayroll, useUpdatePayroll } from "@/services/payrollService";
import type { Payroll } from "@/types/entity";
import { directApiClient } from "@/services/apiWrapper";

const { Option } = Select;

interface PayrollFormProps {
	visible: boolean;
	payroll: Payroll | null;
	onClose: () => void;
}

interface AttendanceSummary {
	workingDays: number;
	presentDays: number;
	halfDays: number;
	absentDays: number;
	leaveDays: number;
	allowedLeaves: number;
	excessLeaves: number;
	paidDays: number;
	unpaidDays: number;
	attendancePercentage: number;
}

const PayrollForm: React.FC<PayrollFormProps> = ({ visible, payroll, onClose }) => {
	const [form] = Form.useForm();
	const { data: employees = [] } = useEmployees();
	const createMutation = useCreatePayroll();
	const updateMutation = useUpdatePayroll();
	const [loadingAttendance, setLoadingAttendance] = useState(false);
	const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);

	useEffect(() => {
		if (visible) {
			if (payroll) {
				form.setFieldsValue({
					...payroll,
					employeeId: typeof payroll.employeeId === "string" ? payroll.employeeId : payroll.employeeId._id,
					paymentDate: payroll.paymentDate ? dayjs(payroll.paymentDate) : null,
				});
			} else {
				form.resetFields();
				setAttendanceSummary(null);
			}
		}
	}, [payroll, form, visible]);

	const handleEmployeeChange = (employeeId: string) => {
		const selectedEmployee = employees.find((emp) => emp._id === employeeId);
		if (selectedEmployee) {
			form.setFieldsValue({
				baseSalary: selectedEmployee.salary,
			});
		}
		// Fetch attendance if month and year are already selected
		const month = form.getFieldValue("month");
		const year = form.getFieldValue("year");
		if (month && year) {
			fetchAttendanceSummary(employeeId, month, year);
		}
	};

	const handleMonthYearChange = () => {
		const employeeId = form.getFieldValue("employeeId");
		const month = form.getFieldValue("month");
		const year = form.getFieldValue("year");

		if (employeeId && month && year) {
			fetchAttendanceSummary(employeeId, month, year);
		}
	};

	const fetchAttendanceSummary = async (employeeId: string, month: number, year: number) => {
		try {
			setLoadingAttendance(true);
			const response = await directApiClient.get<AttendanceSummary>(
				`/attendance/month-summary?employeeId=${employeeId}&month=${month}&year=${year}`,
			);
			setAttendanceSummary(response);

			// Auto-populate attendance fields
			form.setFieldsValue({
				workingDays: response.workingDays,
				presentDays: response.presentDays,
				paidDays: response.paidDays,
			});

			// Calculate deductions based on unpaid days
			calculateDeductions(response);
		} catch (error) {
			console.error("Error fetching attendance:", error);
			message.warning("Could not fetch attendance data for this month");
			setAttendanceSummary(null);
		} finally {
			setLoadingAttendance(false);
		}
	};

	const calculateDeductions = (attendance: AttendanceSummary) => {
		const baseSalary = form.getFieldValue("baseSalary") || 0;
		const allowances = form.getFieldValue("allowances") || 0;

		// Calculate per-day salary
		const totalEarnings = baseSalary + allowances;
		const perDaySalary = attendance.workingDays > 0 ? totalEarnings / attendance.workingDays : 0;

		// Calculate deduction for unpaid days
		const deductionAmount = perDaySalary * attendance.unpaidDays;

		form.setFieldsValue({
			deductions: Math.round(deductionAmount),
		});
	};

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();

			// Calculate net salary
			const netSalary =
				(values.baseSalary || 0) + (values.allowances || 0) + (values.bonus || 0) - (values.deductions || 0);

			const formData = {
				...values,
				netSalary,
				paymentDate: values.paymentDate ? values.paymentDate.toISOString() : undefined,
			};

			if (payroll) {
				await updateMutation.mutateAsync({ id: payroll._id, payroll: formData });
				message.success("Payroll updated successfully");
			} else {
				await createMutation.mutateAsync(formData);
				message.success("Payroll created successfully");
			}

			onClose();
			form.resetFields();
			setAttendanceSummary(null);
		} catch (error) {
			console.error("Form validation failed:", error);
		}
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

	return (
		<Modal
			title={payroll ? "Edit Payroll" : "Create Payroll"}
			open={visible}
			onOk={handleSubmit}
			onCancel={onClose}
			width={900}
			confirmLoading={createMutation.isPending || updateMutation.isPending}
		>
			<Form
				form={form}
				layout="vertical"
				initialValues={{ allowances: 0, deductions: 0, bonus: 0, paymentStatus: "pending" }}
			>
				<Form.Item name="employeeId" label="Employee" rules={[{ required: true, message: "Please select employee" }]}>
					<Select
						placeholder="Select employee"
						showSearch
						onChange={handleEmployeeChange}
						filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
					>
						{employees.map((emp) => (
							<Option key={emp._id} value={emp._id} label={`${emp.name} (${emp.employeeId})`}>
								{emp.name} ({emp.employeeId})
							</Option>
						))}
					</Select>
				</Form.Item>

				<div className="grid grid-cols-2 gap-4">
					<Form.Item name="month" label="Month" rules={[{ required: true, message: "Please select month" }]}>
						<Select placeholder="Select month" onChange={handleMonthYearChange}>
							{months.map((month, index) => (
								<Option key={month} value={index + 1}>
									{month}
								</Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item name="year" label="Year" rules={[{ required: true, message: "Please enter year" }]}>
						<InputNumber
							className="w-full"
							placeholder="Enter year"
							min={2000}
							max={2100}
							onChange={handleMonthYearChange}
						/>
					</Form.Item>
				</div>

				{loadingAttendance && (
					<div className="text-center py-4">
						<Spin tip="Loading attendance data..." />
					</div>
				)}

				{attendanceSummary && (
					<Alert
						message="Attendance Summary"
						description={
							<div className="text-sm">
								<p>
									<strong>Working Days:</strong> {attendanceSummary.workingDays} | <strong>Present:</strong>{" "}
									{attendanceSummary.presentDays} | <strong>Half Days:</strong> {attendanceSummary.halfDays} |{" "}
									<strong>Absent:</strong> {attendanceSummary.absentDays} | <strong>On Leave:</strong>{" "}
									{attendanceSummary.leaveDays}
								</p>
								<p>
									<strong>Allowed Leaves:</strong> {attendanceSummary.allowedLeaves} | <strong>Excess Leaves:</strong>{" "}
									{attendanceSummary.excessLeaves} | <strong>Paid Days:</strong> {attendanceSummary.paidDays} |{" "}
									<strong>Unpaid Days:</strong> {attendanceSummary.unpaidDays}
								</p>
								<p>
									<strong>Attendance:</strong> {attendanceSummary.attendancePercentage.toFixed(1)}%
								</p>
							</div>
						}
						type="info"
						className="mb-4"
					/>
				)}

				<div className="grid grid-cols-2 gap-4">
					<Form.Item
						name="baseSalary"
						label="Base Salary (₹)"
						rules={[{ required: true, message: "Please enter base salary" }]}
					>
						<InputNumber
							className="w-full"
							placeholder="Auto-filled from employee"
							min={0}
							formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
							parser={(value) => value?.replace(/₹\s?|(,*)/g, "") as any}
							onChange={() => {
								if (attendanceSummary) {
									calculateDeductions(attendanceSummary);
								}
							}}
						/>
					</Form.Item>

					<Form.Item name="allowances" label="Allowances (₹)">
						<InputNumber
							className="w-full"
							placeholder="Enter allowances"
							min={0}
							formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
							parser={(value) => value?.replace(/₹\s?|(,*)/g, "") as any}
							onChange={() => {
								if (attendanceSummary) {
									calculateDeductions(attendanceSummary);
								}
							}}
						/>
					</Form.Item>

					<Form.Item name="deductions" label="Deductions (₹)" tooltip="Auto-calculated based on attendance">
						<InputNumber
							className="w-full"
							placeholder="Auto-calculated"
							min={0}
							formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
							parser={(value) => value?.replace(/₹\s?|(,*)/g, "") as any}
						/>
					</Form.Item>

					<Form.Item name="bonus" label="Bonus (₹)">
						<InputNumber
							className="w-full"
							placeholder="Enter bonus"
							min={0}
							formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
							parser={(value) => value?.replace(/₹\s?|(,*)/g, "") as any}
						/>
					</Form.Item>

					<Form.Item
						name="workingDays"
						label="Working Days"
						rules={[{ required: true, message: "Please enter working days" }]}
						tooltip="Auto-filled from attendance"
					>
						<InputNumber className="w-full" placeholder="Auto-filled" min={0} max={31} disabled />
					</Form.Item>

					<Form.Item
						name="presentDays"
						label="Present Days"
						rules={[{ required: true, message: "Please enter present days" }]}
						tooltip="Auto-filled from attendance"
					>
						<InputNumber className="w-full" placeholder="Auto-filled" min={0} max={31} disabled />
					</Form.Item>

					<Form.Item
						name="paidDays"
						label="Paid Days"
						rules={[{ required: true, message: "Please enter paid days" }]}
						tooltip="Auto-calculated (4 leaves allowed/month)"
					>
						<InputNumber className="w-full" placeholder="Auto-calculated" min={0} max={31} disabled />
					</Form.Item>

					<Form.Item
						name="paymentStatus"
						label="Payment Status"
						rules={[{ required: true, message: "Please select status" }]}
					>
						<Select placeholder="Select status">
							<Option value="pending">Pending</Option>
							<Option value="paid">Paid</Option>
						</Select>
					</Form.Item>

					<Form.Item name="paymentDate" label="Payment Date">
						<DatePicker className="w-full" format="DD/MM/YYYY" />
					</Form.Item>
				</div>

				<Form.Item name="notes" label="Notes">
					<Input.TextArea placeholder="Add any notes or remarks" rows={3} />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default PayrollForm;
