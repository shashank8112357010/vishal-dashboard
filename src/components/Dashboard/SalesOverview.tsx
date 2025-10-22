import { ArrowDownOutlined, ArrowUpOutlined, DollarOutlined } from "@ant-design/icons";
import { Card, Col, Row } from "antd";
import type React from "react";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { formatCurrency } from "@/utils/format-number";
import StatsCard from "./StatsCard";

const SalesOverview: React.FC = () => {
	const { getTotalSales, getTotalPurchases, invoices } = useInvoiceStore();

	const totalSales = getTotalSales();
	const totalPurchases = getTotalPurchases();
	const netProfit = totalSales - totalPurchases;
	const totalTransactions = invoices.length;

	const pendingInvoices = invoices.filter((inv) => inv.paymentStatus === "pending").length;
	const pendingAmount = invoices
		.filter((inv) => inv.paymentStatus !== "paid")
		.reduce((sum, inv) => sum + inv.balanceAmount, 0);

	return (
		<Card title="Sales Overview" size="small">
			<Row gutter={[16, 16]}>
				<Col xs={24} sm={12} lg={6}>
					<StatsCard
						title="Total Sales"
						value={formatCurrency(totalSales)}
						icon={<ArrowUpOutlined />}
						color="#52c41a"
					/>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<StatsCard
						title="Total Purchases"
						value={formatCurrency(totalPurchases)}
						icon={<ArrowDownOutlined />}
						color="#ff4d4f"
					/>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<StatsCard
						title="Net Profit"
						value={formatCurrency(netProfit)}
						icon={<DollarOutlined />}
						color={netProfit >= 0 ? "#52c41a" : "#ff4d4f"}
					/>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<StatsCard title="Total Transactions" value={totalTransactions} color="#1890ff" />
				</Col>
			</Row>

			<Row gutter={[16, 16]} style={{ marginTop: 16 }}>
				<Col xs={24} sm={12}>
					<StatsCard title="Pending Invoices" value={pendingInvoices} color="#ff4d4f" />
				</Col>
				<Col xs={24} sm={12}>
					<StatsCard title="Pending Amount" value={formatCurrency(pendingAmount)} color="#ff4d4f" />
				</Col>
			</Row>
		</Card>
	);
};

export default SalesOverview;
