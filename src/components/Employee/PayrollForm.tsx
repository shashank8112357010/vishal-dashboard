import { DatePicker, Form, Input, InputNumber, Modal, Select, message } from "antd";
import dayjs from "dayjs";
import type React from "react";
import { useEffect } from "react";
import { useEmployees } from "@/services/employeeService";
import { useCreatePayroll, useUpdatePayroll } from "@/services/payrollService";
import type { Payroll } from "@/types/entity";

const { Option } = Select;

interface PayrollFormProps {
	visible: boolean;
	payroll: Payroll | null;
	onClose: () => void;
}

const PayrollForm: React.FC<PayrollFormProps> = ({ visible, payroll, onClose }) => {
	const [form] = Form.useForm();
	const { data: employees = [] } = useEmployees();
	const createMutation = useCreatePayroll();
	const updateMutation = useUpdatePayroll();

	useEffect(() => {
		if (payroll) {
			form.setFieldsValue({
				...payroll,
				employeeId: typeof payroll.employeeId === "string" ? payroll.employeeId : payroll.employeeId._id,
				paymentDate: payroll.paymentDate ? dayjs(payroll.paymentDate) : null,
			});
		} else {
			form.resetFields();
		}
	}, [payroll, form]);

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			const formData = {
				...values,
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
			width={700}
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
						filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
					>
						{employees.map((emp) => (
							<Option key={emp._id} value={emp._id}>
								{emp.name} ({emp.employeeId})
							</Option>
						))}
					</Select>
				</Form.Item>

				<div className="grid grid-cols-2 gap-4">
					<Form.Item name="month" label="Month" rules={[{ required: true, message: "Please select month" }]}>
						<Select placeholder="Select month">
							{months.map((month, index) => (
								<Option key={month} value={index + 1}>
									{month}
								</Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item name="year" label="Year" rules={[{ required: true, message: "Please enter year" }]}>
						<InputNumber className="w-full" placeholder="Enter year" min={2000} max={2100} />
					</Form.Item>

					<Form.Item
						name="baseSalary"
						label="Base Salary (₹)"
						rules={[{ required: true, message: "Please enter base salary" }]}
					>
						<InputNumber
							className="w-full"
							placeholder="Enter base salary"
							min={0}
							formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
							parser={(value) => value?.replace(/₹\s?|(,*)/g, "") as any}
						/>
					</Form.Item>

					<Form.Item name="allowances" label="Allowances (₹)">
						<InputNumber
							className="w-full"
							placeholder="Enter allowances"
							min={0}
							formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
							parser={(value) => value?.replace(/₹\s?|(,*)/g, "") as any}
						/>
					</Form.Item>

					<Form.Item name="deductions" label="Deductions (₹)">
						<InputNumber
							className="w-full"
							placeholder="Enter deductions"
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
					>
						<InputNumber className="w-full" placeholder="Enter working days" min={0} max={31} />
					</Form.Item>

					<Form.Item
						name="presentDays"
						label="Present Days"
						rules={[{ required: true, message: "Please enter present days" }]}
					>
						<InputNumber className="w-full" placeholder="Enter present days" min={0} max={31} />
					</Form.Item>

					<Form.Item name="paidDays" label="Paid Days" rules={[{ required: true, message: "Please enter paid days" }]}>
						<InputNumber className="w-full" placeholder="Enter paid days" min={0} max={31} />
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
