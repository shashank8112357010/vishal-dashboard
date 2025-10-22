import { ArrowDownOutlined, ArrowUpOutlined, DollarOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Card, Col, Row } from "antd";
import type React from "react";
import { useMemo } from "react";
import { useInvoices } from "@/services/invoiceService";
import { useInventory } from "@/services/inventoryService";
import { useParties } from "@/services/partyService";
import { formatCurrency } from "@/utils/format-number";
import type { InventoryItem } from "@/types/entity";
import StatsCard from "./StatsCard";

const SalesOverview: React.FC = () => {
	const { data: invoices = [] } = useInvoices();
	const { data: items = [] } = useInventory();
	const { data: parties = [] } = useParties();

	const stats = useMemo(() => {
		const totalSales = invoices
			.filter((inv) => inv.invoiceType === "sale")
			.reduce((sum, inv) => sum + inv.totalAmount, 0);

		const totalPurchases = invoices
			.filter((inv) => inv.invoiceType === "purchase")
			.reduce((sum, inv) => sum + inv.totalAmount, 0);

		const netProfit = totalSales - totalPurchases;
		const totalTransactions = invoices.length;

		const pendingAmount = invoices
			.filter((inv) => inv.paymentStatus !== "paid")
			.reduce((sum, inv) => sum + inv.balanceAmount, 0);

		const inventoryValue = items.reduce(
			(sum: number, item: InventoryItem) => sum + item.quantityAvailable * item.sellingPrice,
			0,
		);

		const lowStockItems = items.filter((item: InventoryItem) => item.quantityAvailable < 10).length;

		return {
			totalSales,
			totalPurchases,
			netProfit,
			totalTransactions,
			pendingAmount,
			inventoryValue,
			lowStockItems,
			totalParties: parties.length,
		};
	}, [invoices, items, parties]);

	return (
		<Card title="Business Overview" size="small">
			<Row gutter={[16, 16]}>
				<Col xs={24} sm={12} lg={6}>
					<StatsCard
						title="Total Sales"
						value={formatCurrency(stats.totalSales)}
						icon={<ArrowUpOutlined />}
						color="#52c41a"
					/>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<StatsCard
						title="Total Purchases"
						value={formatCurrency(stats.totalPurchases)}
						icon={<ArrowDownOutlined />}
						color="#ff4d4f"
					/>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<StatsCard
						title="Net Profit"
						value={formatCurrency(stats.netProfit)}
						icon={<DollarOutlined />}
						color={stats.netProfit >= 0 ? "#52c41a" : "#ff4d4f"}
					/>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<StatsCard
						title="Inventory Value"
						value={formatCurrency(stats.inventoryValue)}
						icon={<ShoppingCartOutlined />}
						color="#1890ff"
					/>
				</Col>
			</Row>

			<Row gutter={[16, 16]} style={{ marginTop: 16 }}>
				<Col xs={24} sm={12} lg={6}>
					<StatsCard title="Total Parties" value={stats.totalParties} color="#722ed1" />
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<StatsCard title="Total Items" value={items.length} color="#13c2c2" />
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<StatsCard title="Low Stock Items" value={stats.lowStockItems} color="#ff4d4f" />
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<StatsCard title="Pending Amount" value={formatCurrency(stats.pendingAmount)} color="#faad14" />
				</Col>
			</Row>
		</Card>
	);
};

export default SalesOverview;
