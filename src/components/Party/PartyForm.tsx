import { Form, Input, InputNumber, Modal, message, Select } from "antd";
import type React from "react";
import { useEffect } from "react";
import { useCreateParty, useUpdateParty } from "@/services/partyService";
import type { Party } from "@/types/entity";

const { Option } = Select;

interface PartyFormProps {
	visible: boolean;
	party: Party | null;
	onClose: () => void;
}

const PartyForm: React.FC<PartyFormProps> = ({ visible, party, onClose }) => {
	const [form] = Form.useForm();
	const createMutation = useCreateParty();
	const updateMutation = useUpdateParty();

	useEffect(() => {
		if (party) {
			form.setFieldsValue(party);
		} else {
			form.resetFields();
		}
	}, [party, form]);

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();

			if (party) {
				await updateMutation.mutateAsync({ id: party._id, party: values });
				message.success("Party updated successfully");
			} else {
				await createMutation.mutateAsync({
					...values,
					balanceAmount: values.balanceAmount || 0,
				});
				message.success("Party created successfully");
			}

			onClose();
			form.resetFields();
		} catch (error) {
			console.error("Form validation failed:", error);
		}
	};

	return (
		<Modal
			title={party ? "Edit Party" : "Add New Party"}
			open={visible}
			onOk={handleSubmit}
			onCancel={onClose}
			width={600}
			confirmLoading={createMutation.isPending || updateMutation.isPending}
		>
			<Form
				form={form}
				layout="vertical"
				initialValues={{
					partyType: "debtor",
					balanceAmount: 0,
				}}
			>
				<Form.Item name="partyName" label="Party Name" rules={[{ required: true, message: "Please enter party name" }]}>
					<Input placeholder="Enter party name" />
				</Form.Item>

				<Form.Item
					name="partyType"
					label="Party Type"
					rules={[{ required: true, message: "Please select party type" }]}
				>
					<Select placeholder="Select party type">
						<Option value="creditor">Creditor (Supplier)</Option>
						<Option value="debtor">Debtor (Customer)</Option>
					</Select>
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

				<Form.Item name="state" label="State" rules={[{ required: true, message: "Please enter state" }]}>
					<Input placeholder="Enter state" />
				</Form.Item>

				<Form.Item name="city" label="City" rules={[{ required: true, message: "Please enter city" }]}>
					<Input placeholder="Enter city" />
				</Form.Item>

				<Form.Item name="address" label="Address" rules={[{ required: true, message: "Please enter address" }]}>
					<Input.TextArea rows={3} placeholder="Enter complete address" />
				</Form.Item>

				<Form.Item
					name="gstNumber"
					label="GST Number"
					rules={[
						{
							pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
							message: "Please enter valid GST number",
						},
					]}
				>
					<Input placeholder="Enter GST number (optional)" />
				</Form.Item>

				{party && (
					<Form.Item name="balanceAmount" label="Balance Amount">
						<InputNumber
							style={{ width: "100%" }}
							formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
							parser={(value) => value?.replace(/₹\s?|(,*)/g, "")}
							disabled
						/>
					</Form.Item>
				)}
			</Form>
		</Modal>
	);
};

export default PartyForm;
