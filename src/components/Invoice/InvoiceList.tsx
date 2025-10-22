import {
	DeleteOutlined,
	EditOutlined,
	EyeOutlined,
	FilePdfOutlined,
	PlusOutlined,
	SearchOutlined,
} from "@ant-design/icons";
import { Button, Card, DatePicker, Input, Modal, message, Space, Table, Tag } from "antd";
import dayjs from "dayjs";
import type React from "react";
import { useState } from "react";
import { useDeleteInvoice, useInvoices } from "@/services/invoiceService";
import type { Invoice, Party } from "@/types/entity";
import { formatCurrency } from "@/utils/format-number";
import InvoiceForm from "./InvoiceForm";

const { RangePicker } = DatePicker;

const InvoiceList: React.FC = () => {
	const [searchText, setSearchText] = useState("");
	const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
	const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
	const [isFormVisible, setIsFormVisible] = useState(false);
	const [isViewing, setIsViewing] = useState(false);

	const { data: invoices = [], isLoading } = useInvoices();
	const deleteMutation = useDeleteInvoice();

	const handleDelete = (id: string) => {
		Modal.confirm({
			title: "Delete Invoice",
			content: "Are you sure you want to delete this invoice? This will reverse all stock changes and party balances.",
			onOk: async () => {
				try {
					await deleteMutation.mutateAsync(id);
					message.success("Invoice deleted successfully");
				} catch (_error) {
					message.error("Failed to delete invoice");
				}
			},
		});
	};

	const handleView = (invoice: Invoice) => {
		setSelectedInvoice(invoice);
		setIsViewing(true);
		setIsFormVisible(true);
	};

	const handleEdit = (invoice: Invoice) => {
		setSelectedInvoice(invoice);
		setIsViewing(false);
		setIsFormVisible(true);
	};

	const handleAdd = () => {
		setSelectedInvoice(null);
		setIsViewing(false);
		setIsFormVisible(true);
	};

	const handleFormClose = () => {
		setSelectedInvoice(null);
		setIsFormVisible(false);
		setIsViewing(false);
	};

	let filteredInvoices = invoices.filter((invoice) => {
		const party = invoice.partyId as Party;
		return (
			invoice.invoiceNumber.toLowerCase().includes(searchText.toLowerCase()) ||
			(party?.partyName?.toLowerCase().includes(searchText.toLowerCase()) ?? false)
		);
	});

	if (dateRange[0] && dateRange[1]) {
		filteredInvoices = filteredInvoices.filter((invoice) => {
			const invoiceDate = dayjs(invoice.date);
			return invoiceDate.isAfter(dateRange[0]) && invoiceDate.isBefore(dateRange[1]);
		});
	}

	const columns = [
		{
			title: "Invoice #",
			dataIndex: "invoiceNumber",
			key: "invoiceNumber",
			sorter: (a: Invoice, b: Invoice) => a.invoiceNumber.localeCompare(b.invoiceNumber),
		},
		{
			title: "Date",
			dataIndex: "date",
			key: "date",
			render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
			sorter: (a: Invoice, b: Invoice) => dayjs(a.date).unix() - dayjs(b.date).unix(),
		},
		{
			title: "Party",
			key: "party",
			render: (_: unknown, record: Invoice) => {
				const party = record.partyId as Party;
				return party?.partyName || "N/A";
			},
		},
		{
			title: "Type",
			dataIndex: "invoiceType",
			key: "invoiceType",
			render: (type: string) => <Tag color={type === "purchase" ? "red" : "green"}>{type.toUpperCase()}</Tag>,
			filters: [
				{ text: "Purchase", value: "purchase" },
				{ text: "Sale", value: "sale" },
			],
			onFilter: (value: any, record: Invoice) => record.invoiceType === value,
		},
		{
			title: "Items",
			key: "itemCount",
			render: (_: unknown, record: Invoice) => `${record.items.length} items`,
		},
		{
			title: "Total Amount",
			dataIndex: "totalAmount",
			key: "totalAmount",
			render: (amount: number) => formatCurrency(amount),
			sorter: (a: Invoice, b: Invoice) => a.totalAmount - b.totalAmount,
		},
		{
			title: "Payment Status",
			dataIndex: "paymentStatus",
			key: "paymentStatus",
			render: (status: string) => {
				const colorMap = {
					pending: "orange",
					partial: "blue",
					paid: "green",
				};
				return <Tag color={colorMap[status as keyof typeof colorMap]}>{status.toUpperCase()}</Tag>;
			},
			filters: [
				{ text: "Pending", value: "pending" },
				{ text: "Partial", value: "partial" },
				{ text: "Paid", value: "paid" },
			],
			onFilter: (value: any, record: Invoice) => record.paymentStatus === value,
		},
		{
			title: "Balance",
			dataIndex: "balanceAmount",
			key: "balanceAmount",
			render: (amount: number) => (
				<span style={{ color: amount > 0 ? "red" : "inherit" }}>{formatCurrency(amount)}</span>
			),
		},
		{
			title: "Actions",
			key: "actions",
			render: (_: any, record: Invoice) => (
				<Space size="middle">
					<Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} />
					<Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
					<Button type="text" icon={<FilePdfOutlined />} title="Download PDF" />
					<Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)} />
				</Space>
			),
		},
	];

	return (
		<>
			<Card>
				<div style={{ marginBottom: 16 }}>
					<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
						<Space>
							<Input
								placeholder="Search by invoice # or party name"
								prefix={<SearchOutlined />}
								style={{ width: 300 }}
								value={searchText}
								onChange={(e) => setSearchText(e.target.value)}
							/>
							<RangePicker onChange={(dates) => setDateRange(dates || [null, null])} format="DD/MM/YYYY" />
						</Space>
						<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
							Create Invoice
						</Button>
					</div>
				</div>
				<Table
					columns={columns}
					dataSource={filteredInvoices}
					rowKey="_id"
					loading={isLoading}
					pagination={{
						defaultPageSize: 10,
						showSizeChanger: true,
						showTotal: (total) => `Total ${total} invoices`,
					}}
				/>
			</Card>
			{isFormVisible && (
				<InvoiceForm visible={isFormVisible} invoice={selectedInvoice} viewOnly={isViewing} onClose={handleFormClose} />
			)}
		</>
	);
};

export default InvoiceList;
