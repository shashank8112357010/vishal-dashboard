import { Form, Input, InputNumber, Modal, message, Radio } from "antd";
import React from "react";
import { useAdjustStock } from "@/services/inventoryService";
import type { InventoryItem } from "@/types/entity";

interface StockAdjustFormProps {
	visible: boolean;
	item: InventoryItem | null;
	onClose: () => void;
}

const StockAdjustForm: React.FC<StockAdjustFormProps> = ({ visible, item, onClose }) => {
	const [form] = Form.useForm();
	const adjustMutation = useAdjustStock();

	React.useEffect(() => {
		if (visible && item) {
			form.resetFields();
			form.setFieldValue("currentStock", item.quantityAvailable);
		}
	}, [visible, item, form]);

	const handleSubmit = async () => {
		if (!item) return;

		try {
			const values = await form.validateFields();
			const adjustment = values.adjustmentType === "add" ? values.quantity : -values.quantity;

			await adjustMutation.mutateAsync({
				itemId: item._id,
				adjustment,
				reason: values.reason,
			});

			message.success("Stock adjusted successfully");
			onClose();
		} catch (error) {
			if ((error as any).response?.status === 400) {
				message.error("Insufficient stock for this adjustment");
			} else {
				console.error("Form validation failed:", error);
			}
		}
	};

	return (
		<Modal
			title="Adjust Stock"
			open={visible}
			onOk={handleSubmit}
			onCancel={onClose}
			width={500}
			confirmLoading={adjustMutation.isPending}
		>
			{item && (
				<Form form={form} layout="vertical">
					<Form.Item label="Item">
						<Input value={item.itemName} disabled />
					</Form.Item>

					<Form.Item label="Current Stock" name="currentStock">
						<InputNumber style={{ width: "100%" }} disabled formatter={(value) => `${value} ${item.unitType}`} />
					</Form.Item>

					<Form.Item
						name="adjustmentType"
						label="Adjustment Type"
						rules={[{ required: true, message: "Please select adjustment type" }]}
						initialValue="add"
					>
						<Radio.Group>
							<Radio value="add">Add Stock</Radio>
							<Radio value="remove">Remove Stock</Radio>
						</Radio.Group>
					</Form.Item>

					<Form.Item
						name="quantity"
						label="Quantity"
						rules={[
							{ required: true, message: "Please enter quantity" },
							{ type: "number", min: 1, message: "Quantity must be at least 1" },
						]}
					>
						<InputNumber min={1} style={{ width: "100%" }} placeholder="Enter quantity to adjust" />
					</Form.Item>

					<Form.Item
						name="reason"
						label="Reason for Adjustment"
						rules={[{ required: true, message: "Please provide a reason" }]}
					>
						<Input.TextArea rows={3} placeholder="E.g., Damaged goods, Stock correction, Returns, etc." />
					</Form.Item>
				</Form>
			)}
		</Modal>
	);
};

export default StockAdjustForm;
