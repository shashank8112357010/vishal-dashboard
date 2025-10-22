import { AlertOutlined, ShopOutlined } from "@ant-design/icons";
import { Badge, Button, Card, List, Space } from "antd";
import type React from "react";
import { useInventoryStore } from "@/store/useInventoryStore";
import type { InventoryItem } from "@/types/entity";
import { formatCurrency } from "@/utils/format-number";

const InventoryWidget: React.FC = () => {
	const { items, lowStockItems } = useInventoryStore();

	const totalStockValue = items.reduce((total, item) => total + item.quantityAvailable * item.purchasePrice, 0);

	const totalItems = items.length;
	const lowStockCount = lowStockItems.length;

	return (
		<Space direction="vertical" style={{ width: "100%" }} size="middle">
			<Card title="Inventory Overview" extra={<ShopOutlined />} size="small">
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, textAlign: "center" }}>
					<div>
						<div style={{ fontSize: "24px", fontWeight: "bold", color: "#1890ff" }}>{totalItems}</div>
						<div style={{ color: "#666" }}>Total Items</div>
					</div>
					<div>
						<div style={{ fontSize: "24px", fontWeight: "bold", color: "#52c41a" }}>
							{formatCurrency(totalStockValue)}
						</div>
						<div style={{ color: "#666" }}>Stock Value</div>
					</div>
					<div>
						<div style={{ fontSize: "24px", fontWeight: "bold", color: "#ff4d4f" }}>{lowStockCount}</div>
						<div style={{ color: "#666" }}>Low Stock</div>
					</div>
				</div>
			</Card>

			{lowStockCount > 0 && (
				<Card
					title={
						<span>
							<AlertOutlined style={{ color: "#ff4d4f", marginRight: 8 }} />
							Low Stock Items
						</span>
					}
					size="small"
				>
					<List
						dataSource={lowStockItems.slice(0, 5)}
						renderItem={(item: InventoryItem) => (
							<List.Item>
								<div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
									<span>{item.itemName}</span>
									<Badge status="error" text={`${item.quantityAvailable} ${item.unitType}`} />
								</div>
							</List.Item>
						)}
					/>
					{lowStockCount > 5 && (
						<div style={{ textAlign: "center", marginTop: 8 }}>
							<Button type="link" size="small">
								View all {lowStockCount} low stock items
							</Button>
						</div>
					)}
				</Card>
			)}
		</Space>
	);
};

export default InventoryWidget;
