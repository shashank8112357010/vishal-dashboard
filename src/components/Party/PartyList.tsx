import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Input, Modal, message, Space, Table, Tag } from "antd";
import type React from "react";
import { useState } from "react";
import { useDeleteParty, useParties } from "@/services/partyService";
import type { Party } from "@/types/entity";
import { formatCurrency } from "@/utils/format-number";
import PartyForm from "./PartyForm";

const PartyList: React.FC = () => {
	const [searchText, setSearchText] = useState("");
	const [editingParty, setEditingParty] = useState<Party | null>(null);
	const [isFormVisible, setIsFormVisible] = useState(false);

	const { data: parties = [], isLoading } = useParties();
	const deleteMutation = useDeleteParty();

	const handleDelete = (id: string) => {
		Modal.confirm({
			title: "Delete Party",
			content: "Are you sure you want to delete this party? This action cannot be undone.",
			onOk: async () => {
				try {
					await deleteMutation.mutateAsync(id);
					message.success("Party deleted successfully");
				} catch (_error) {
					message.error("Failed to delete party");
				}
			},
		});
	};

	const handleEdit = (party: Party) => {
		setEditingParty(party);
		setIsFormVisible(true);
	};

	const handleAdd = () => {
		setEditingParty(null);
		setIsFormVisible(true);
	};

	const handleFormClose = () => {
		setEditingParty(null);
		setIsFormVisible(false);
	};

	const filteredParties = parties.filter(
		(party) =>
			party.partyName.toLowerCase().includes(searchText.toLowerCase()) ||
			party.phoneNumber.includes(searchText) ||
			party.city.toLowerCase().includes(searchText.toLowerCase()),
	);

	const columns = [
		{
			title: "Party Name",
			dataIndex: "partyName",
			key: "partyName",
			sorter: (a: Party, b: Party) => a.partyName.localeCompare(b.partyName),
		},
		{
			title: "Type",
			dataIndex: "partyType",
			key: "partyType",
			render: (type: string) => <Tag color={type === "creditor" ? "green" : "blue"}>{type.toUpperCase()}</Tag>,
			filters: [
				{ text: "Creditor", value: "creditor" },
				{ text: "Debtor", value: "debtor" },
			],
			onFilter: (value: any, record: Party) => record.partyType === value,
		},
		{
			title: "Phone",
			dataIndex: "phoneNumber",
			key: "phoneNumber",
		},
		{
			title: "City",
			dataIndex: "city",
			key: "city",
		},
		{
			title: "State",
			dataIndex: "state",
			key: "state",
		},
		{
			title: "Balance Amount",
			dataIndex: "balanceAmount",
			key: "balanceAmount",
			render: (amount: number) => (
				<span style={{ color: amount < 0 ? "red" : "green" }}>{formatCurrency(Math.abs(amount))}</span>
			),
			sorter: (a: Party, b: Party) => a.balanceAmount - b.balanceAmount,
		},
		{
			title: "GST Number",
			dataIndex: "gstNumber",
			key: "gstNumber",
			render: (gst: string) => gst || "-",
		},
		{
			title: "Actions",
			key: "actions",
			render: (_: any, record: Party) => (
				<Space size="middle">
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
						placeholder="Search by name, phone, or city"
						prefix={<SearchOutlined />}
						style={{ width: "100%", minWidth: 250, maxWidth: 300 }}
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
					/>
					<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
						Add Party
					</Button>
				</div>
				<Table
					columns={columns}
					dataSource={filteredParties}
					rowKey="_id"
					loading={isLoading}
					scroll={{ x: 1000 }}
					pagination={{
						defaultPageSize: 10,
						showSizeChanger: true,
						showTotal: (total) => `Total ${total} parties`,
					}}
				/>
			</Card>
			<PartyForm visible={isFormVisible} party={editingParty} onClose={handleFormClose} />
		</>
	);
};

export default PartyList;
