import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Input, Modal, message, Space, Table, Tag } from "antd";
import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useDeleteCustomer, useCustomers } from "@/services/customerService";
import type { Customer } from "@/types/entity";
import dayjs from "dayjs";
import CustomerForm from "./CustomerForm";

const CustomerList: React.FC = () => {
	const navigate = useNavigate();
	const [searchText, setSearchText] = useState("");
	const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
	const [isFormVisible, setIsFormVisible] = useState(false);

	const { data: customers = [], isLoading } = useCustomers();
	const deleteMutation = useDeleteCustomer();

	const handleDelete = (id: string) => {
		Modal.confirm({
			title: "Delete Customer",
			content: "Are you sure you want to delete this customer? This action cannot be undone.",
			onOk: async () => {
				try {
					await deleteMutation.mutateAsync(id);
					message.success("Customer deleted successfully");
				} catch (_error) {
					message.error("Failed to delete customer");
				}
			},
		});
	};

	const handleEdit = (customer: Customer) => {
		setEditingCustomer(customer);
		setIsFormVisible(true);
	};

	const handleAdd = () => {
		setEditingCustomer(null);
		setIsFormVisible(true);
	};

	const handleFormClose = () => {
		setEditingCustomer(null);
		setIsFormVisible(false);
	};

	const handleViewProfile = (id: string) => {
		navigate(`/bicycle-shop/customers/${id}`);
	};

	const filteredCustomers = customers.filter(
		(customer) =>
			customer.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
			customer.phone.includes(searchText) ||
			(customer.email && customer.email.toLowerCase().includes(searchText.toLowerCase())) ||
			(customer.address && customer.address.toLowerCase().includes(searchText.toLowerCase())),
	);

	const columns = [
		{
			title: "Customer Name",
			dataIndex: "customerName",
			key: "customerName",
			sorter: (a: Customer, b: Customer) => a.customerName.localeCompare(b.customerName),
		},
		{
			title: "Phone",
			dataIndex: "phone",
			key: "phone",
		},
		{
			title: "Email",
			dataIndex: "email",
			key: "email",
			render: (email: string) => email || "-",
		},
		{
			title: "Address",
			dataIndex: "address",
			key: "address",
			render: (address: string) => (address ? address.substring(0, 50) + (address.length > 50 ? "..." : "") : "-"),
		},
		{
			title: "Birthday",
			dataIndex: "birthday",
			key: "birthday",
			render: (birthday: string) => (birthday ? dayjs(birthday).format("MMM DD, YYYY") : "-"),
		},
		{
			title: "Newsletter",
			dataIndex: "newsletter",
			key: "newsletter",
			render: (newsletter: boolean) => (
				<Tag color={newsletter ? "green" : "default"}>{newsletter ? "Subscribed" : "Not Subscribed"}</Tag>
			),
			filters: [
				{ text: "Subscribed", value: true },
				{ text: "Not Subscribed", value: false },
			],
			onFilter: (value: any, record: Customer) => record.newsletter === value,
		},
		{
			title: "Actions",
			key: "actions",
			render: (_: any, record: Customer) => (
				<Space size="small">
					<Button
						type="link"
						icon={<EyeOutlined />}
						onClick={() => handleViewProfile(record._id)}
						title="View Profile"
					/>
					<Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} title="Edit" />
					<Button
						type="link"
						danger
						icon={<DeleteOutlined />}
						onClick={() => handleDelete(record._id)}
						title="Delete"
					/>
				</Space>
			),
		},
	];

	return (
		<Card
			title="Customer Management"
			extra={
				<Space>
					<Input
						placeholder="Search customers..."
						prefix={<SearchOutlined />}
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						style={{ width: 250 }}
						allowClear
					/>
					<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
						Add Customer
					</Button>
				</Space>
			}
		>
			<Table
				columns={columns}
				dataSource={filteredCustomers}
				rowKey="_id"
				loading={isLoading}
				childrenColumnName="tableChildren"
				pagination={{
					pageSize: 10,
					showSizeChanger: true,
					showTotal: (total) => `Total ${total} customers`,
				}}
			/>

			<CustomerForm visible={isFormVisible} customer={editingCustomer} onClose={handleFormClose} />
		</Card>
	);
};

export default CustomerList;
