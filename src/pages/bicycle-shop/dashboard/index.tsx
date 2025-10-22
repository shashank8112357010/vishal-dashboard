import { Col, Row, Space } from "antd";
import type React from "react";
import {
	InventoryDistributionChart,
	InventoryWidget,
	RecentInvoicesWidget,
	SalesOverview,
	SalesTrendChart,
	TopItemsChart,
} from "@/components/Dashboard";

const BicycleDashboard: React.FC = () => {
	return (
		<div style={{ padding: "24px" }}>
			<h1 style={{ marginBottom: "24px" }}>Bicycle Shop Dashboard</h1>

			<Space direction="vertical" size="large" style={{ width: "100%" }}>
				{/* Stats Overview */}
				<SalesOverview />

				{/* Charts Row 1 */}
				<Row gutter={[24, 24]}>
					<Col xs={24} lg={12}>
						<SalesTrendChart />
					</Col>
					<Col xs={24} lg={12}>
						<InventoryDistributionChart />
					</Col>
				</Row>

				{/* Charts Row 2 */}
				<Row gutter={[24, 24]}>
					<Col xs={24} lg={12}>
						<TopItemsChart />
					</Col>
					<Col xs={24} lg={12}>
						<InventoryWidget />
					</Col>
				</Row>

				{/* Recent Activity */}
				<Row gutter={[24, 24]}>
					<Col xs={24}>
						<RecentInvoicesWidget />
					</Col>
				</Row>
			</Space>
		</div>
	);
};

export default BicycleDashboard;
