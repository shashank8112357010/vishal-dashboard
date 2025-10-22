import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Form, Input, Modal, message, DatePicker, Switch, Button, Space } from "antd";
import type React from "react";
import { useEffect } from "react";
import { useCreateCustomer, useUpdateCustomer } from "@/services/customerService";
import type { Customer } from "@/types/entity";
import dayjs from "dayjs";

const { TextArea } = Input;

interface CustomerFormProps {
	visible: boolean;
	customer: Customer | null;
	onClose: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ visible, customer, onClose }) => {
	const [form] = Form.useForm();
	const createMutation = useCreateCustomer();
	const updateMutation = useUpdateCustomer();

	useEffect(() => {
		if (customer) {
			form.setFieldsValue({
				...customer,
				birthday: customer.birthday ? dayjs(customer.birthday) : undefined,
			});
		} else {
			form.resetFields();
		}
	}, [customer, form]);

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();

			const customerData = {
				...values,
				birthday: values.birthday ? values.birthday.toISOString() : undefined,
				children: values.children || [],
			};

			if (customer) {
				await updateMutation.mutateAsync({ id: customer._id, customer: customerData });
				message.success("Customer updated successfully");
			} else {
				await createMutation.mutateAsync(customerData);
				message.success("Customer created successfully");
			}
			form.resetFields();
			onClose();
		} catch (_error: any) {
			message.error("Failed to save customer");
		}
	};

	return (
		<Modal
			title={customer ? "Edit Customer" : "Add New Customer"}
			open={visible}
			onCancel={onClose}
			onOk={handleSubmit}
			width={700}
			confirmLoading={createMutation.isPending || updateMutation.isPending}
		>
			<Form form={form} layout="vertical" initialValues={{ newsletter: false }}>
				<Form.Item
					name="customerName"
					label="Customer Name"
					rules={[{ required: true, message: "Please enter customer name" }]}
				>
					<Input placeholder="Enter customer name" />
				</Form.Item>

				<Form.Item
					name="phone"
					label="Phone Number"
					rules={[
						{ required: true, message: "Please enter phone number" },
						{ pattern: /^[0-9]{10}$/, message: "Please enter a valid 10-digit phone number" },
					]}
				>
					<Input placeholder="Enter phone number" maxLength={10} />
				</Form.Item>

				<Form.Item
					name="email"
					label="Email Address (Optional)"
					rules={[{ type: "email", message: "Please enter a valid email address" }]}
				>
					<Input placeholder="Enter email address" />
				</Form.Item>

				<Form.Item name="address" label="Address (Optional)">
					<TextArea placeholder="Enter complete address" rows={3} />
				</Form.Item>

				<Form.Item name="birthday" label="Birthday (Optional)">
					<DatePicker style={{ width: "100%" }} placeholder="Select birthday" format="YYYY-MM-DD" />
				</Form.Item>

				<Form.Item label="Children Names (Optional)">
					<Form.List name="children">
						{(fields, { add, remove }) => (
							<>
								{fields.map((field) => (
									<Space key={field.key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
										<Form.Item {...field} noStyle>
											<Input placeholder="Child name" style={{ width: 300 }} />
										</Form.Item>
										<MinusCircleOutlined onClick={() => remove(field.name)} />
									</Space>
								))}
								<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
									Add Child
								</Button>
							</>
						)}
					</Form.List>
				</Form.Item>

				<Form.Item name="newsletter" label="Newsletter Subscription" valuePropName="checked">
					<Switch checkedChildren="Subscribed" unCheckedChildren="Not Subscribed" />
				</Form.Item>

				<Form.Item name="notes" label="Notes (Optional)">
					<TextArea placeholder="Any additional notes about the customer" rows={3} />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default CustomerForm;
