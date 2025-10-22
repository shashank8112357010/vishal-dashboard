import { DatePicker, Form, Input, InputNumber, Modal, Select, message } from "antd";
import dayjs from "dayjs";
import type React from "react";
import { useEffect } from "react";
import { useCreateEmployee, useUpdateEmployee } from "@/services/employeeService";
import type { Employee } from "@/types/entity";

const { Option } = Select;

interface EmployeeFormProps {
	visible: boolean;
	employee: Employee | null;
	onClose: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ visible, employee, onClose }) => {
	const [form] = Form.useForm();
	const createMutation = useCreateEmployee();
	const updateMutation = useUpdateEmployee();

	useEffect(() => {
		if (employee) {
			form.setFieldsValue({
				...employee,
				dateOfJoining: employee.dateOfJoining ? dayjs(employee.dateOfJoining) : null,
			});
		} else {
			form.resetFields();
		}
	}, [employee, form]);

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			const formData = {
				...values,
				dateOfJoining: values.dateOfJoining ? values.dateOfJoining.toISOString() : undefined,
			};

			if (employee) {
				await updateMutation.mutateAsync({ id: employee._id, employee: formData });
				message.success("Employee updated successfully");
			} else {
				await createMutation.mutateAsync(formData);
				message.success("Employee created successfully");
			}

			onClose();
			form.resetFields();
		} catch (error) {
			console.error("Form validation failed:", error);
		}
	};

	return (
		<Modal
			title={employee ? "Edit Employee" : "Add New Employee"}
			open={visible}
			onOk={handleSubmit}
			onCancel={onClose}
			width={700}
			confirmLoading={createMutation.isPending || updateMutation.isPending}
		>
			<Form form={form} layout="vertical" initialValues={{ status: "active" }}>
				<div className="grid grid-cols-2 gap-4">
					<Form.Item
						name="employeeId"
						label="Employee ID"
						rules={[{ required: true, message: "Please enter employee ID" }]}
					>
						<Input placeholder="Enter employee ID" disabled={!!employee} />
					</Form.Item>

					<Form.Item name="name" label="Full Name" rules={[{ required: true, message: "Please enter full name" }]}>
						<Input placeholder="Enter full name" />
					</Form.Item>

					<Form.Item
						name="email"
						label="Email"
						rules={[
							{ required: true, message: "Please enter email" },
							{ type: "email", message: "Please enter valid email" },
						]}
					>
						<Input placeholder="Enter email address" />
					</Form.Item>

					<Form.Item
						name="phoneNumber"
						label="Phone Number"
						rules={[
							{ required: true, message: "Please enter phone number" },
							{ pattern: /^[0-9]{10}$/, message: "Please enter valid 10-digit phone number" },
						]}
					>
						<Input placeholder="Enter 10-digit phone number" maxLength={10} />
					</Form.Item>

					<Form.Item
						name="dateOfJoining"
						label="Date of Joining"
						rules={[{ required: true, message: "Please select date of joining" }]}
					>
						<DatePicker className="w-full" format="DD/MM/YYYY" />
					</Form.Item>

					<Form.Item name="position" label="Position" rules={[{ required: true, message: "Please enter position" }]}>
						<Input placeholder="Enter position" />
					</Form.Item>

					<Form.Item
						name="department"
						label="Department"
						rules={[{ required: true, message: "Please enter department" }]}
					>
						<Input placeholder="Enter department" />
					</Form.Item>

					<Form.Item name="salary" label="Salary" rules={[{ required: true, message: "Please enter salary" }]}>
						<InputNumber
							className="w-full"
							placeholder="Enter salary"
							min={0}
							formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
							parser={(value) => value?.replace(/₹\s?|(,*)/g, "") as any}
						/>
					</Form.Item>

					<Form.Item name="status" label="Status" rules={[{ required: true, message: "Please select status" }]}>
						<Select placeholder="Select status">
							<Option value="active">Active</Option>
							<Option value="inactive">Inactive</Option>
							<Option value="on_leave">On Leave</Option>
						</Select>
					</Form.Item>
				</div>

				<Form.Item name="address" label="Address" rules={[{ required: true, message: "Please enter address" }]}>
					<Input.TextArea placeholder="Enter full address" rows={3} />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default EmployeeForm;
