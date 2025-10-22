import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, InputNumber, Modal, message, Select, Table } from "antd";
import dayjs from "dayjs";
import type React from "react";
import { useEffect, useState } from "react";
import { useInventory } from "@/services/inventoryService";
import { useCreateInvoice, useUpdateInvoice } from "@/services/invoiceService";
import { useParties } from "@/services/partyService";
import type { Invoice, InvoiceItem } from "@/types/entity";
import { formatCurrency } from "@/utils/format-number";

const { Option } = Select;
const { TextArea } = Input;

interface InvoiceFormProps {
	visible: boolean;
	invoice: Invoice | null;
	viewOnly?: boolean;
	onClose: () => void;
}

interface FormInvoiceItem {
	key: string;
	itemId: string;
	quantity: number;
	pricePerUnit: number;
	totalAmount: number;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ visible, invoice, viewOnly = false, onClose }) => {
	const [form] = Form.useForm();
	const [items, setItems] = useState<FormInvoiceItem[]>([]);
	const [totalAmount, setTotalAmount] = useState(0);

	const createMutation = useCreateInvoice();
	const updateMutation = useUpdateInvoice();
	const { data: parties = [] } = useParties();
	const { data: inventory = [] } = useInventory();

	useEffect(() => {
		if (invoice) {
			const formItems: FormInvoiceItem[] = invoice.items.map((item, index) => ({
				key: `${index}`,
				itemId: typeof item.itemId === "string" ? item.itemId : item.itemId._id,
				quantity: item.quantity,
				pricePerUnit: item.pricePerUnit,
				totalAmount: item.totalAmount,
			}));

			form.setFieldsValue({
				...invoice,
				date: dayjs(invoice.date),
				partyId: typeof invoice.partyId === "string" ? invoice.partyId : invoice.partyId._id,
			});
			setItems(formItems);
			setTotalAmount(invoice.totalAmount);
		} else {
			form.resetFields();
			form.setFieldValue("date", dayjs());
			form.setFieldValue("paymentStatus", "pending");
			setItems([]);
			setTotalAmount(0);
		}
	}, [invoice, form]);

	useEffect(() => {
		const total = items.reduce((sum, item) => sum + item.totalAmount, 0);
		setTotalAmount(total);
		form.setFieldValue("totalAmount", total);
		form.setFieldValue("balanceAmount", total);
	}, [items, form]);

	const generateInvoiceNumber = () => {
		const date = dayjs().format("YYYYMMDD");
		const random = Math.floor(Math.random() * 1000)
			.toString()
			.padStart(3, "0");
		return `INV-${date}-${random}`;
	};

	const handleAddItem = () => {
		const newItem: FormInvoiceItem = {
			key: Date.now().toString(),
			itemId: "",
			quantity: 1,
			pricePerUnit: 0,
			totalAmount: 0,
		};
		setItems([...items, newItem]);
	};

	const handleRemoveItem = (key: string) => {
		setItems(items.filter((item) => item.key !== key));
	};

	const handleItemChange = (key: string, field: keyof FormInvoiceItem, value: any) => {
		const newItems = items.map((item) => {
			if (item.key === key) {
				const updatedItem = { ...item, [field]: value };

				if (field === "itemId") {
					const selectedItem = inventory.find((inv) => inv._id === value);
					if (selectedItem) {
						const invoiceType = form.getFieldValue("invoiceType");
						updatedItem.pricePerUnit =
							invoiceType === "purchase" ? selectedItem.purchasePrice : selectedItem.sellingPrice;
						updatedItem.totalAmount = updatedItem.quantity * updatedItem.pricePerUnit;
					}
				} else if (field === "quantity" || field === "pricePerUnit") {
					updatedItem.totalAmount = updatedItem.quantity * updatedItem.pricePerUnit;
				}

				return updatedItem;
			}
			return item;
		});
		setItems(newItems);
	};

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();

			if (items.length === 0) {
				message.error("Please add at least one item");
				return;
			}

			const invoiceItems: InvoiceItem[] = items.map((item) => ({
				itemId: item.itemId,
				quantity: item.quantity,
				pricePerUnit: item.pricePerUnit,
				totalAmount: item.totalAmount,
			}));

			const invoiceData = {
				...values,
				invoiceNumber: values.invoiceNumber || generateInvoiceNumber(),
				date: values.date.toISOString(),
				items: invoiceItems,
				totalAmount,
				balanceAmount: totalAmount,
			};

			if (invoice) {
				await updateMutation.mutateAsync({ id: invoice._id, invoice: invoiceData });
				message.success("Invoice updated successfully");
			} else {
				await createMutation.mutateAsync(invoiceData);
				message.success("Invoice created successfully");
			}

			onClose();
		} catch (error) {
			console.error("Form validation failed:", error);
		}
	};

	const columns = [
		{
			title: "Item",
			dataIndex: "itemId",
			key: "itemId",
			render: (itemId: string, record: FormInvoiceItem) => (
				<Select
					style={{ width: "100%" }}
					placeholder="Select item"
					value={itemId}
					onChange={(value) => handleItemChange(record.key, "itemId", value)}
					disabled={viewOnly}
					showSearch
					optionFilterProp="children"
				>
					{inventory.map((item) => (
						<Option key={item._id} value={item._id}>
							{item.itemName} ({item.quantityAvailable} {item.unitType})
						</Option>
					))}
				</Select>
			),
		},
		{
			title: "Quantity",
			dataIndex: "quantity",
			key: "quantity",
			width: 120,
			render: (quantity: number, record: FormInvoiceItem) => (
				<InputNumber
					min={1}
					value={quantity}
					onChange={(value) => handleItemChange(record.key, "quantity", value || 1)}
					disabled={viewOnly}
					style={{ width: "100%" }}
				/>
			),
		},
		{
			title: "Price/Unit",
			dataIndex: "pricePerUnit",
			key: "pricePerUnit",
			width: 120,
			render: (price: number, record: FormInvoiceItem) => (
				<InputNumber
					min={0}
					value={price}
					onChange={(value) => handleItemChange(record.key, "pricePerUnit", value || 0)}
					disabled={viewOnly}
					style={{ width: "100%" }}
					formatter={(value) => `₹ ${value}`}
					parser={(value) => value?.replace(/₹\s?/g, "")}
				/>
			),
		},
		{
			title: "Total",
			dataIndex: "totalAmount",
			key: "totalAmount",
			width: 120,
			render: (amount: number) => formatCurrency(amount),
		},
		{
			title: "Action",
			key: "action",
			width: 80,
			render: (_: any, record: FormInvoiceItem) => (
				<Button
					type="text"
					danger
					icon={<DeleteOutlined />}
					onClick={() => handleRemoveItem(record.key)}
					disabled={viewOnly}
				/>
			),
		},
	];

	return (
		<Modal
			title={viewOnly ? "View Invoice" : invoice ? "Edit Invoice" : "Create Invoice"}
			open={visible}
			onOk={viewOnly ? onClose : handleSubmit}
			onCancel={onClose}
			width={900}
			confirmLoading={createMutation.isPending || updateMutation.isPending}
			okText={viewOnly ? "Close" : "Save"}
			cancelButtonProps={{ style: viewOnly ? { display: "none" } : {} }}
		>
			<Form form={form} layout="vertical" disabled={viewOnly}>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
					<Form.Item name="invoiceNumber" label="Invoice Number">
						<Input placeholder={`Auto-generate: ${generateInvoiceNumber()}`} />
					</Form.Item>

					<Form.Item name="date" label="Date" rules={[{ required: true, message: "Please select date" }]}>
						<DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
					</Form.Item>

					<Form.Item name="partyId" label="Party" rules={[{ required: true, message: "Please select party" }]}>
						<Select placeholder="Select party" showSearch optionFilterProp="children">
							{parties.map((party) => (
								<Option key={party._id} value={party._id}>
									{party.partyName} ({party.partyType})
								</Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item
						name="invoiceType"
						label="Invoice Type"
						rules={[{ required: true, message: "Please select invoice type" }]}
					>
						<Select placeholder="Select invoice type">
							<Option value="purchase">Purchase</Option>
							<Option value="sale">Sale</Option>
						</Select>
					</Form.Item>
				</div>

				<div style={{ marginBottom: 16 }}>
					<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
						<h4>Items</h4>
						{!viewOnly && (
							<Button type="dashed" onClick={handleAddItem} icon={<PlusOutlined />}>
								Add Item
							</Button>
						)}
					</div>
					<Table columns={columns} dataSource={items} rowKey="key" pagination={false} size="small" />
				</div>

				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
					<Form.Item
						name="paymentStatus"
						label="Payment Status"
						rules={[{ required: true, message: "Please select payment status" }]}
					>
						<Select placeholder="Select payment status">
							<Option value="pending">Pending</Option>
							<Option value="partial">Partial</Option>
							<Option value="paid">Paid</Option>
						</Select>
					</Form.Item>

					<Form.Item label="Total Amount">
						<div style={{ fontSize: "20px", fontWeight: "bold", color: "#1890ff" }}>{formatCurrency(totalAmount)}</div>
					</Form.Item>
				</div>

				<Form.Item name="notes" label="Notes">
					<TextArea rows={3} placeholder="Additional notes (optional)" />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default InvoiceForm;
