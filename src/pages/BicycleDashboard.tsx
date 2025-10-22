import { Col, Row, Space } from "antd";
import type React from "react";
import { InventoryWidget, RecentInvoicesWidget, SalesOverview } from "@/components/Dashboard";
import { useInventory } from "@/services/inventoryService";
import { useInvoices } from "@/services/invoiceService";
import { useParties } from "@/services/partyService";

const BicycleDashboard: React.FC = () => {
	// Load data on mount
	const { isLoading: partiesLoading } = useParties();
	const { isLoading: inventoryLoading } = useInventory();
	const { isLoading: invoicesLoading } = useInvoices();

	const _isLoading = partiesLoading || inventoryLoading || invoicesLoading;

	return (
		<div style={{ padding: "24px" }}>
			<h1 style={{ marginBottom: "24px" }}>Bicycle Shop Dashboard</h1>

			<Space direction="vertical" size="large" style={{ width: "100%" }}>
				<SalesOverview />

				<Row gutter={[24, 24]}>
					<Col xs={24} lg={12}>
						<InventoryWidget />
					</Col>
					<Col xs={24} lg={12}>
						<RecentInvoicesWidget />
					</Col>
				</Row>
			</Space>
		</div>
	);
};

export default BicycleDashboard;
