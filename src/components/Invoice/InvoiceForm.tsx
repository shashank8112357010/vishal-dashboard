import { DeleteOutlined, PlusOutlined, UserAddOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, InputNumber, Modal, message, Select, Table } from "antd";
import dayjs from "dayjs";
import type React from "react";
import { useEffect, useState } from "react";
import { useCustomers, useCreateCustomer } from "@/services/customerService";
import { useInventory } from "@/services/inventoryService";
import { useCreateInvoice, useUpdateInvoice } from "@/services/invoiceService";
import { useParties, useCreateParty } from "@/services/partyService";
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
	const [quickPartyForm] = Form.useForm();
	const [quickCustomerForm] = Form.useForm();
	const [items, setItems] = useState<FormInvoiceItem[]>([]);
	const [totalAmount, setTotalAmount] = useState(0);
	const [showQuickAddParty, setShowQuickAddParty] = useState(false);
	const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false);

	const createMutation = useCreateInvoice();
	const updateMutation = useUpdateInvoice();
	const createPartyMutation = useCreateParty();
	const createCustomerMutation = useCreateCustomer();
	const { data: parties = [] } = useParties();
	const { data: customers = [] } = useCustomers();
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

	const handleQuickAddParty = async () => {
		try {
			const values = await quickPartyForm.validateFields();
			const newParty = await createPartyMutation.mutateAsync({
				...values,
				partyType: form.getFieldValue("invoiceType") === "sale" ? "debtor" : "creditor",
				balanceAmount: 0,
				transactions: [],
			});
			form.setFieldValue("partyId", newParty._id);
			message.success(`Party "${newParty.partyName}" added successfully`);
			setShowQuickAddParty(false);
			quickPartyForm.resetFields();
		} catch (error) {
			console.error("Failed to add party:", error);
		}
	};

	const handleQuickAddCustomer = async () => {
		try {
			const values = await quickCustomerForm.validateFields();
			const newCustomer = await createCustomerMutation.mutateAsync({
				...values,
				newsletter: false,
			});
			form.setFieldValue("customerId", newCustomer._id);
			message.success(`Customer "${newCustomer.customerName}" added successfully`);
			setShowQuickAddCustomer(false);
			quickCustomerForm.resetFields();
		} catch (error) {
			console.error("Failed to add customer:", error);
		}
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
					parser={(value) => Number(value?.replace(/₹\s?/g, ""))}
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
		<>
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
							<Input.Group compact>
								<Select
									placeholder="Select party"
									showSearch
									optionFilterProp="children"
									style={{ width: "calc(100% - 40px)" }}
								>
									{parties.map((party) => (
										<Option key={party._id} value={party._id}>
											{party.partyName} ({party.partyType})
										</Option>
									))}
								</Select>
								<Button
									type="primary"
									icon={<UserAddOutlined />}
									onClick={() => setShowQuickAddParty(true)}
									disabled={viewOnly}
									style={{ width: 40 }}
								/>
							</Input.Group>
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

						<Form.Item name="customerId" label="Customer (Optional for sales)">
							<Input.Group compact>
								<Select
									placeholder="Select customer"
									showSearch
									optionFilterProp="children"
									style={{ width: "calc(100% - 40px)" }}
								>
									{customers.map((customer) => (
										<Option key={customer._id} value={customer._id}>
											{customer.customerName} ({customer.phone})
										</Option>
									))}
								</Select>
								<Button
									type="primary"
									icon={<UserAddOutlined />}
									onClick={() => setShowQuickAddCustomer(true)}
									disabled={viewOnly}
									style={{ width: 40 }}
								/>
							</Input.Group>
						</Form.Item>

						<div />
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

						<Form.Item
							name="paymentMode"
							label="Payment Mode"
							rules={[{ required: true, message: "Please select payment mode" }]}
						>
							<Select placeholder="Select payment mode">
								<Option value="cash">Cash</Option>
								<Option value="online">Online</Option>
								<Option value="both">Both (Cash + Online)</Option>
							</Select>
						</Form.Item>
					</div>

					<div style={{ marginBottom: 16 }}>
						<Form.Item label="Total Amount">
							<div style={{ fontSize: "20px", fontWeight: "bold", color: "#1890ff" }}>
								{formatCurrency(totalAmount)}
							</div>
						</Form.Item>
					</div>

					<Form.Item name="notes" label="Notes">
						<TextArea rows={3} placeholder="Additional notes (optional)" />
					</Form.Item>
				</Form>
			</Modal>

			{/* Quick Add Party Modal */}
			<Modal
				title="Quick Add Party"
				open={showQuickAddParty}
				onOk={handleQuickAddParty}
				onCancel={() => {
					setShowQuickAddParty(false);
					quickPartyForm.resetFields();
				}}
				confirmLoading={createPartyMutation.isPending}
				width={500}
			>
				<Form form={quickPartyForm} layout="vertical">
					<Form.Item
						name="partyName"
						label="Party Name"
						rules={[{ required: true, message: "Please enter party name" }]}
					>
						<Input placeholder="Enter party name" />
					</Form.Item>
					<Form.Item
						name="phoneNumber"
						label="Phone Number"
						rules={[{ required: true, message: "Please enter phone number" }]}
					>
						<Input placeholder="Enter phone number" />
					</Form.Item>
					<Form.Item name="address" label="Address">
						<Input placeholder="Enter address (optional)" />
					</Form.Item>
					<Form.Item name="city" label="City">
						<Input placeholder="Enter city (optional)" />
					</Form.Item>
					<Form.Item name="state" label="State">
						<Input placeholder="Enter state (optional)" />
					</Form.Item>
				</Form>
			</Modal>

			{/* Quick Add Customer Modal */}
			<Modal
				title="Quick Add Customer"
				open={showQuickAddCustomer}
				onOk={handleQuickAddCustomer}
				onCancel={() => {
					setShowQuickAddCustomer(false);
					quickCustomerForm.resetFields();
				}}
				confirmLoading={createCustomerMutation.isPending}
				width={500}
			>
				<Form form={quickCustomerForm} layout="vertical">
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
						rules={[{ required: true, message: "Please enter phone number" }]}
					>
						<Input placeholder="Enter phone number" />
					</Form.Item>
					<Form.Item name="email" label="Email">
						<Input type="email" placeholder="Enter email (optional)" />
					</Form.Item>
					<Form.Item name="address" label="Address">
						<Input placeholder="Enter address (optional)" />
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
};

export default InvoiceForm;
