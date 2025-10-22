import { Modal, message, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type React from "react";
import { useState } from "react";
import { Icon } from "@/components/icon";
import PartyForm from "@/components/Party/PartyForm";
import { useDeleteParty, useParties } from "@/services/partyService";
import type { Party } from "@/types/entity";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Input } from "@/ui/input";
import { formatCurrency } from "@/utils/format-number";

const PartiesPage: React.FC = () => {
	const [searchText, setSearchText] = useState("");
	const [editingParty, setEditingParty] = useState<Party | null>(null);
	const [isFormVisible, setIsFormVisible] = useState(false);

	const { data: parties = [], isLoading, error } = useParties();
	const deleteMutation = useDeleteParty();

	console.log("Parties data:", parties);
	console.log("Loading:", isLoading);
	console.log("Error:", error);

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
			party.partyName?.toLowerCase().includes(searchText.toLowerCase()) ||
			party.phoneNumber?.includes(searchText) ||
			party.city?.toLowerCase().includes(searchText.toLowerCase()),
	);

	const columns: ColumnsType<Party> = [
		{
			title: "Party Name",
			dataIndex: "partyName",
			key: "partyName",
			sorter: (a: Party, b: Party) => (a.partyName || "").localeCompare(b.partyName || ""),
		},
		{
			title: "Type",
			dataIndex: "partyType",
			key: "partyType",
			render: (type: string) => (
				<Badge variant={type === "creditor" ? "secondary" : "default"}>{type?.toUpperCase()}</Badge>
			),
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
				<span style={{ color: amount < 0 ? "red" : "green" }}>{formatCurrency(Math.abs(amount || 0))}</span>
			),
			sorter: (a: Party, b: Party) => (a.balanceAmount || 0) - (b.balanceAmount || 0),
		},
		{
			title: "GST Number",
			dataIndex: "gstNumber",
			key: "gstNumber",
			render: (gst: string) => gst || "-",
		},
		{
			title: "Action",
			key: "operation",
			align: "center",
			width: 100,
			render: (_, record: Party) => (
				<div className="flex w-full justify-center text-gray-500">
					<Button variant="ghost" size="icon" onClick={() => handleEdit(record)}>
						<Icon icon="solar:pen-bold-duotone" size={18} />
					</Button>
					<Button variant="ghost" size="icon" onClick={() => handleDelete(record._id)}>
						<Icon icon="mingcute:delete-2-fill" size={18} className="text-red-500" />
					</Button>
				</div>
			),
		},
	];

	return (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-2xl font-bold">Party Management</h2>
							<p className="text-muted-foreground">Manage suppliers and customers</p>
						</div>
						<Button onClick={handleAdd}>
							<Icon icon="solar:add-circle-bold-duotone" size={18} className="mr-2" />
							Add Party
						</Button>
					</div>
					<div className="flex items-center gap-4 pt-4">
						<Input
							placeholder="Search by name, phone, or city"
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							className="max-w-sm"
						/>
					</div>
				</CardHeader>
				<CardContent>
					{error ? (
						<div className="text-center py-8">
							<p className="text-red-500">Error loading parties: {error.message}</p>
						</div>
					) : (
						<Table
							rowKey="_id"
							size="small"
							scroll={{ x: "max-content" }}
							pagination={{
								defaultPageSize: 10,
								showSizeChanger: true,
								showTotal: (total) => `Total ${total} parties`,
							}}
							columns={columns}
							dataSource={filteredParties}
							loading={isLoading}
						/>
					)}
				</CardContent>
			</Card>
			<PartyForm visible={isFormVisible} party={editingParty} onClose={handleFormClose} />
		</>
	);
};

export default PartiesPage;
