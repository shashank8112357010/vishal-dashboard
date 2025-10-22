import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, ToolOutlined } from "@ant-design/icons";
import { Badge, Button, Card, Input, Modal, message, Space, Table, Tag } from "antd";
import type React from "react";
import { useState } from "react";
import { useDeleteInventory, useInventory } from "@/services/inventoryService";
import type { InventoryItem } from "@/types/entity";
import { formatCurrency } from "@/utils/format-number";
import InventoryForm from "./InventoryForm";
import StockAdjustForm from "./StockAdjustForm";

const InventoryList: React.FC = () => {
	const [searchText, setSearchText] = useState("");
	const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
	const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
	const [isFormVisible, setIsFormVisible] = useState(false);
	const [isAdjustFormVisible, setIsAdjustFormVisible] = useState(false);

	const { data: items = [], isLoading } = useInventory();
	const deleteMutation = useDeleteInventory();

	const handleDelete = (id: string) => {
		Modal.confirm({
			title: "Delete Item",
			content: "Are you sure you want to delete this item? This action cannot be undone.",
			onOk: async () => {
				try {
					await deleteMutation.mutateAsync(id);
					message.success("Item deleted successfully");
				} catch (_error) {
					message.error("Failed to delete item");
				}
			},
		});
	};

	const handleEdit = (item: InventoryItem) => {
		setEditingItem(item);
		setIsFormVisible(true);
	};

	const handleAdd = () => {
		setEditingItem(null);
		setIsFormVisible(true);
	};

	const handleAdjust = (item: InventoryItem) => {
		setAdjustingItem(item);
		setIsAdjustFormVisible(true);
	};

	const handleFormClose = () => {
		setEditingItem(null);
		setIsFormVisible(false);
	};

	const handleAdjustFormClose = () => {
		setAdjustingItem(null);
		setIsAdjustFormVisible(false);
	};

	const filteredItems = items.filter(
		(item) =>
			item.itemName.toLowerCase().includes(searchText.toLowerCase()) ||
			item.category.toLowerCase().includes(searchText.toLowerCase()),
	);

	const columns = [
		{
			title: "Item Name",
			dataIndex: "itemName",
			key: "itemName",
			sorter: (a: InventoryItem, b: InventoryItem) => a.itemName.localeCompare(b.itemName),
		},
		{
			title: "Category",
			dataIndex: "category",
			key: "category",
			render: (category: string) => (
				<Tag color={category === "bicycle" ? "blue" : "green"}>{category.toUpperCase()}</Tag>
			),
			filters: [
				{ text: "Bicycle", value: "bicycle" },
				{ text: "Spare Part", value: "spare_part" },
			],
			onFilter: (value: any, record: InventoryItem) => record.category === value,
		},
		{
			title: "Quantity",
			dataIndex: "quantityAvailable",
			key: "quantityAvailable",
			render: (qty: number, record: InventoryItem) => (
				<Badge status={qty < 10 ? "error" : qty < 50 ? "warning" : "success"} text={`${qty} ${record.unitType}`} />
			),
			sorter: (a: InventoryItem, b: InventoryItem) => a.quantityAvailable - b.quantityAvailable,
		},
		{
			title: "Unit Type",
			dataIndex: "unitType",
			key: "unitType",
			render: (unit: string) => unit.charAt(0).toUpperCase() + unit.slice(1),
		},
		{
			title: "Stock Type",
			dataIndex: "stockType",
			key: "stockType",
			render: (type: string) => <Tag color={type === "fitted" ? "purple" : "cyan"}>{type.toUpperCase()}</Tag>,
		},
		{
			title: "Purchase Price",
			dataIndex: "purchasePrice",
			key: "purchasePrice",
			render: (price: number) => formatCurrency(price),
			sorter: (a: InventoryItem, b: InventoryItem) => a.purchasePrice - b.purchasePrice,
		},
		{
			title: "Selling Price",
			dataIndex: "sellingPrice",
			key: "sellingPrice",
			render: (price: number) => formatCurrency(price),
			sorter: (a: InventoryItem, b: InventoryItem) => a.sellingPrice - b.sellingPrice,
		},
		{
			title: "Stock Value",
			key: "stockValue",
			render: (_: any, record: InventoryItem) => formatCurrency(record.quantityAvailable * record.purchasePrice),
			sorter: (a: InventoryItem, b: InventoryItem) =>
				a.quantityAvailable * a.purchasePrice - b.quantityAvailable * b.purchasePrice,
		},
		{
			title: "Actions",
			key: "actions",
			render: (_: any, record: InventoryItem) => (
				<Space size="middle">
					<Button type="text" icon={<ToolOutlined />} onClick={() => handleAdjust(record)} title="Adjust Stock" />
					<Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
					<Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)} />
				</Space>
			),
		},
	];

	return (
		<>
			<Card>
				<div
					style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "space-between" }}
				>
					<Input
						placeholder="Search by item name or category"
						prefix={<SearchOutlined />}
						style={{ width: "100%", minWidth: 250, maxWidth: 300 }}
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
					/>
					<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
						Add Item
					</Button>
				</div>
				<Table
					columns={columns}
					dataSource={filteredItems}
					rowKey="_id"
					loading={isLoading}
					scroll={{ x: 1200 }}
					pagination={{
						defaultPageSize: 10,
						showSizeChanger: true,
						showTotal: (total) => `Total ${total} items`,
					}}
					summary={(pageData) => {
						const totalValue = pageData.reduce((sum, item) => sum + item.quantityAvailable * item.purchasePrice, 0);
						return (
							<Table.Summary fixed>
								<Table.Summary.Row>
									<Table.Summary.Cell index={0} colSpan={7}>
										<strong>Total Stock Value</strong>
									</Table.Summary.Cell>
									<Table.Summary.Cell index={1}>
										<strong>{formatCurrency(totalValue)}</strong>
									</Table.Summary.Cell>
									<Table.Summary.Cell index={2} />
								</Table.Summary.Row>
							</Table.Summary>
						);
					}}
				/>
			</Card>
			<InventoryForm visible={isFormVisible} item={editingItem} onClose={handleFormClose} />
			<StockAdjustForm visible={isAdjustFormVisible} item={adjustingItem} onClose={handleAdjustFormClose} />
		</>
	);
};

export default InventoryList;
