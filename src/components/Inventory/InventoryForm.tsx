import { Form, Input, InputNumber, Modal, message, Select } from "antd";
import type React from "react";
import { useEffect } from "react";
import { useCreateInventory, useUpdateInventory } from "@/services/inventoryService";
import type { InventoryItem } from "@/types/entity";

const { Option } = Select;

interface InventoryFormProps {
	visible: boolean;
	item: InventoryItem | null;
	onClose: () => void;
}

const InventoryForm: React.FC<InventoryFormProps> = ({ visible, item, onClose }) => {
	const [form] = Form.useForm();
	const createMutation = useCreateInventory();
	const updateMutation = useUpdateInventory();

	useEffect(() => {
		if (item) {
			form.setFieldsValue(item);
		} else {
			form.resetFields();
		}
	}, [item, form]);

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();

			if (item) {
				await updateMutation.mutateAsync({ id: item._id, item: values });
				message.success("Item updated successfully");
			} else {
				await createMutation.mutateAsync({
					...values,
					quantityAvailable: values.quantityAvailable || 0,
					bundleCount: values.bundleCount || 1,
				});
				message.success("Item created successfully");
			}

			onClose();
			form.resetFields();
		} catch (error) {
			console.error("Form validation failed:", error);
		}
	};

	const unitTypeBundleMap: Record<string, number> = {
		piece: 1,
		set: 1,
		pair: 2,
		dozen: 12,
		packet: 1,
	};

	const handleUnitTypeChange = (unitType: string) => {
		form.setFieldsValue({ bundleCount: unitTypeBundleMap[unitType] || 1 });
	};

	return (
		<Modal
			title={item ? "Edit Item" : "Add New Item"}
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
					category: "spare_part",
					unitType: "piece",
					stockType: "loose",
					bundleCount: 1,
					quantityAvailable: 0,
				}}
			>
				<Form.Item name="itemName" label="Item Name" rules={[{ required: true, message: "Please enter item name" }]}>
					<Input placeholder="Enter item name" />
				</Form.Item>

				<Form.Item name="category" label="Category" rules={[{ required: true, message: "Please select category" }]}>
					<Select placeholder="Select category">
						<Option value="bicycle">Bicycle</Option>
						<Option value="spare_part">Spare Part</Option>
					</Select>
				</Form.Item>

				<Form.Item name="unitType" label="Unit Type" rules={[{ required: true, message: "Please select unit type" }]}>
					<Select placeholder="Select unit type" onChange={handleUnitTypeChange}>
						<Option value="piece">Piece</Option>
						<Option value="set">Set</Option>
						<Option value="pair">Pair</Option>
						<Option value="dozen">Dozen</Option>
						<Option value="packet">Packet</Option>
					</Select>
				</Form.Item>

				<Form.Item
					name="bundleCount"
					label="Bundle Count"
					rules={[{ required: true, message: "Please enter bundle count" }]}
				>
					<InputNumber min={1} style={{ width: "100%" }} placeholder="Items per bundle" />
				</Form.Item>

				{!item && (
					<Form.Item
						name="quantityAvailable"
						label="Initial Quantity"
						rules={[{ required: true, message: "Please enter initial quantity" }]}
					>
						<InputNumber min={0} style={{ width: "100%" }} placeholder="Enter initial stock quantity" />
					</Form.Item>
				)}

				<Form.Item
					name="stockType"
					label="Stock Type"
					rules={[{ required: true, message: "Please select stock type" }]}
				>
					<Select placeholder="Select stock type">
						<Option value="loose">Loose</Option>
						<Option value="fitted">Fitted</Option>
					</Select>
				</Form.Item>

				<Form.Item
					name="purchasePrice"
					label="Purchase Price"
					rules={[{ required: true, message: "Please enter purchase price" }]}
				>
					<InputNumber
						min={0}
						style={{ width: "100%" }}
						formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
						parser={(value) => Number(value?.replace(/₹\s?|(,*)/g, "")) as 0}
						placeholder="Enter purchase price"
					/>
				</Form.Item>

				<Form.Item
					name="sellingPrice"
					label="Selling Price"
					rules={[{ required: true, message: "Please enter selling price" }]}
				>
					<InputNumber
						min={0}
						style={{ width: "100%" }}
						formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
						parser={(value) => Number(value?.replace(/₹\s?|(,*)/g, "")) as 0}
						placeholder="Enter selling price"
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default InventoryForm;
