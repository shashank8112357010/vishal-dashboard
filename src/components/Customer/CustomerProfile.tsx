import { ArrowLeftOutlined, MailOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Col, Descriptions, Row, Spin, Table, Tag, Typography } from "antd";
import dayjs from "dayjs";
import type React from "react";
import { useNavigate, useParams } from "react-router";
import { useCustomerProfile } from "@/services/customerService";
import { formatCurrency } from "@/utils/format-number";

const { Title, Text } = Typography;

const CustomerProfile: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { data: profile, isLoading } = useCustomerProfile(id!);

	if (isLoading) {
		return (
			<div style={{ textAlign: "center", padding: "100px" }}>
				<Spin size="large" />
			</div>
		);
	}

	if (!profile) {
		return (
			<Card>
				<Text>Customer not found</Text>
			</Card>
		);
	}

	const { customer, analytics, recentInvoices } = profile;

	const getLoyaltyColor = (status: string) => {
		switch (status) {
			case "Platinum":
				return "#722ed1";
			case "Gold":
				return "#faad14";
			case "Silver":
				return "#8c8c8c";
			case "Bronze":
				return "#d4380d";
			default:
				return "#1890ff";
		}
	};

	const invoiceColumns = [
		{
			title: "Invoice #",
			dataIndex: "invoiceNumber",
			key: "invoiceNumber",
		},
		{
			title: "Date",
			dataIndex: "date",
			key: "date",
			render: (date: string) => dayjs(date).format("MMM DD, YYYY"),
		},
		{
			title: "Amount",
			dataIndex: "totalAmount",
			key: "totalAmount",
			render: (amount: number) => formatCurrency(amount),
		},
		{
			title: "Payment Status",
			dataIndex: "paymentStatus",
			key: "paymentStatus",
			render: (status: string) => {
				const colors: Record<string, string> = {
					paid: "green",
					partial: "orange",
					pending: "red",
				};
				return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
			},
		},
	];

	const productColumns = [
		{
			title: "Product",
			dataIndex: "itemName",
			key: "itemName",
		},
		{
			title: "Category",
			dataIndex: "category",
			key: "category",
			render: (category: string) => (
				<Tag color={category === "bicycle" ? "blue" : "green"}>{category.replace("_", " ").toUpperCase()}</Tag>
			),
		},
		{
			title: "Quantity",
			dataIndex: "totalQuantity",
			key: "totalQuantity",
		},
		{
			title: "Total Amount",
			dataIndex: "totalAmount",
			key: "totalAmount",
			render: (amount: number) => formatCurrency(amount),
		},
	];

	return (
		<div style={{ padding: "24px" }}>
			<Button
				icon={<ArrowLeftOutlined />}
				onClick={() => navigate("/bicycle-shop/customers")}
				style={{ marginBottom: 16 }}
			>
				Back to Customers
			</Button>

			<Row gutter={[24, 24]}>
				{/* Customer Details Card */}
				<Col xs={24} lg={8}>
					<Card>
						<div style={{ textAlign: "center", marginBottom: 24 }}>
							<UserOutlined style={{ fontSize: 64, color: "#1890ff" }} />
							<Title level={3} style={{ marginTop: 16 }}>
								{customer.customerName}
							</Title>
							<Tag color={getLoyaltyColor(analytics.loyaltyStatus)} style={{ fontSize: 14, padding: "4px 12px" }}>
								{analytics.loyaltyStatus} Member
							</Tag>
						</div>

						<Descriptions column={1} size="small">
							<Descriptions.Item
								label={
									<>
										<PhoneOutlined /> Phone
									</>
								}
							>
								{customer.phone}
							</Descriptions.Item>
							{customer.email && (
								<Descriptions.Item
									label={
										<>
											<MailOutlined /> Email
										</>
									}
								>
									{customer.email}
								</Descriptions.Item>
							)}
							{customer.address && <Descriptions.Item label="Address">{customer.address}</Descriptions.Item>}
							{customer.birthday && (
								<Descriptions.Item label="Birthday">
									{dayjs(customer.birthday).format("MMMM DD, YYYY")}
								</Descriptions.Item>
							)}
							{customer.children && customer.children.length > 0 && (
								<Descriptions.Item label="Children">
									{customer.children.map((child, index) => (
										<Tag key={index}>{child}</Tag>
									))}
								</Descriptions.Item>
							)}
							<Descriptions.Item label="Newsletter">
								<Tag color={customer.newsletter ? "green" : "default"}>
									{customer.newsletter ? "Subscribed" : "Not Subscribed"}
								</Tag>
							</Descriptions.Item>
							<Descriptions.Item label="Customer Since">
								{dayjs(analytics.customerSince).format("MMMM DD, YYYY")}
							</Descriptions.Item>
						</Descriptions>

						{customer.notes && (
							<div style={{ marginTop: 16, padding: 12, background: "#f5f5f5", borderRadius: 4 }}>
								<Text strong>Notes:</Text>
								<br />
								<Text type="secondary">{customer.notes}</Text>
							</div>
						)}
					</Card>
				</Col>

				{/* Analytics Cards */}
				<Col xs={24} lg={16}>
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={12}>
							<Card>
								<div style={{ textAlign: "center" }}>
									<Text type="secondary">Total Purchase Amount</Text>
									<Title level={2} style={{ margin: "8px 0", color: "#52c41a" }}>
										{formatCurrency(analytics.totalPurchaseAmount)}
									</Title>
								</div>
							</Card>
						</Col>
						<Col xs={24} sm={12}>
							<Card>
								<div style={{ textAlign: "center" }}>
									<Text type="secondary">Total Invoices</Text>
									<Title level={2} style={{ margin: "8px 0", color: "#1890ff" }}>
										{analytics.totalInvoices}
									</Title>
								</div>
							</Card>
						</Col>
						{analytics.lastPurchaseDate && (
							<Col xs={24}>
								<Card>
									<div style={{ textAlign: "center" }}>
										<Text type="secondary">Last Purchase Date</Text>
										<Title level={4} style={{ margin: "8px 0" }}>
											{dayjs(analytics.lastPurchaseDate).format("MMMM DD, YYYY")}
										</Title>
									</div>
								</Card>
							</Col>
						)}
					</Row>

					{/* Products Purchased */}
					<Card title="Products Purchased" style={{ marginTop: 16 }}>
						<Table
							columns={productColumns}
							dataSource={analytics.productsPurchased}
							rowKey="itemId"
							pagination={false}
							size="small"
						/>
					</Card>

					{/* Recent Invoices */}
					<Card title="Recent Invoices" style={{ marginTop: 16 }}>
						<Table columns={invoiceColumns} dataSource={recentInvoices} rowKey="_id" pagination={false} size="small" />
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default CustomerProfile;
