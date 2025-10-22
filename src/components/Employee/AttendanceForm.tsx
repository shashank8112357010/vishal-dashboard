import { DatePicker, Form, Input, Modal, Select, TimePicker, message } from "antd";
import dayjs from "dayjs";
import type React from "react";
import { useEffect } from "react";
import { useEmployees } from "@/services/employeeService";
import { useCreateAttendance, useUpdateAttendance } from "@/services/attendanceService";
import type { Attendance } from "@/types/entity";

const { Option } = Select;

interface AttendanceFormProps {
	visible: boolean;
	attendance: Attendance | null;
	onClose: () => void;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({ visible, attendance, onClose }) => {
	const [form] = Form.useForm();
	const { data: employees = [] } = useEmployees();
	const createMutation = useCreateAttendance();
	const updateMutation = useUpdateAttendance();

	useEffect(() => {
		if (attendance) {
			form.setFieldsValue({
				...attendance,
				employeeId: typeof attendance.employeeId === "string" ? attendance.employeeId : attendance.employeeId._id,
				date: attendance.date ? dayjs(attendance.date) : null,
				checkIn: attendance.checkIn ? dayjs(attendance.checkIn) : null,
				checkOut: attendance.checkOut ? dayjs(attendance.checkOut) : null,
			});
		} else {
			form.resetFields();
		}
	}, [attendance, form]);

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			const formData = {
				...values,
				date: values.date ? values.date.toISOString() : undefined,
				checkIn: values.checkIn
					? values.date.hour(values.checkIn.hour()).minute(values.checkIn.minute()).toISOString()
					: undefined,
				checkOut: values.checkOut
					? values.date.hour(values.checkOut.hour()).minute(values.checkOut.minute()).toISOString()
					: undefined,
			};

			if (attendance) {
				await updateMutation.mutateAsync({ id: attendance._id, attendance: formData });
				message.success("Attendance updated successfully");
			} else {
				await createMutation.mutateAsync(formData);
				message.success("Attendance marked successfully");
			}

			onClose();
			form.resetFields();
		} catch (error) {
			console.error("Form validation failed:", error);
		}
	};

	return (
		<Modal
			title={attendance ? "Edit Attendance" : "Mark Attendance"}
			open={visible}
			onOk={handleSubmit}
			onCancel={onClose}
			width={600}
			confirmLoading={createMutation.isPending || updateMutation.isPending}
		>
			<Form form={form} layout="vertical" initialValues={{ status: "present" }}>
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

				<Form.Item name="date" label="Date" rules={[{ required: true, message: "Please select date" }]}>
					<DatePicker className="w-full" format="DD/MM/YYYY" />
				</Form.Item>

				<Form.Item name="status" label="Status" rules={[{ required: true, message: "Please select status" }]}>
					<Select placeholder="Select status">
						<Option value="present">Present</Option>
						<Option value="absent">Absent</Option>
						<Option value="half_day">Half Day</Option>
						<Option value="on_leave">On Leave</Option>
					</Select>
				</Form.Item>

				<div className="grid grid-cols-2 gap-4">
					<Form.Item
						name="checkIn"
						label="Check In"
						rules={[
							({ getFieldValue }) => ({
								required: getFieldValue("status") === "present" || getFieldValue("status") === "half_day",
								message: "Please select check-in time",
							}),
						]}
					>
						<TimePicker className="w-full" format="HH:mm" />
					</Form.Item>

					<Form.Item name="checkOut" label="Check Out">
						<TimePicker className="w-full" format="HH:mm" />
					</Form.Item>
				</div>

				<Form.Item name="notes" label="Notes">
					<Input.TextArea placeholder="Add any notes or remarks" rows={3} />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default AttendanceForm;
