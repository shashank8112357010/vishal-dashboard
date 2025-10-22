import { CheckCircleOutlined, ClockCircleOutlined, DollarOutlined } from "@ant-design/icons";
import { Badge, Button, Card, Col, Empty, Row, Space, Statistic, Table, Tag, Tabs } from "antd";
import type React from "react";
import { useState } from "react";
import { useLedgerSummary } from "@/services/ledgerService";
import type { LedgerEntry } from "@/types/entity";
import { formatCurrency } from "@/utils/format-number";
import SettlementDialog from "./SettlementDialog";

const { TabPane } = Tabs;

const LedgerList: React.FC = () => {
	const { data: summary, isLoading } = useLedgerSummary();
	const [settlementVisible, setSettlementVisible] = useState(false);
	const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);

	const handleSettle = (entry: LedgerEntry) => {
		setSelectedEntry(entry);
		setSettlementVisible(true);
	};

	const handleCloseSettlement = () => {
		setSettlementVisible(false);
		setSelectedEntry(null);
	};

	const getStatusTag = (status: string) => {
		const statusConfig = {
			pending: { color: "red", text: "Pending" },
			partial: { color: "orange", text: "Partial" },
			settled: { color: "green", text: "Settled" },
		};
		const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
		return <Tag color={config.color}>{config.text}</Tag>;
	};

	const columns = [
		{
			title: "Party Name",
			dataIndex: "partyId",
			key: "partyName",
			render: (party: any) => party?.partyName || "N/A",
		},
		{
			title: "Description",
			dataIndex: "description",
			key: "description",
		},
		{
			title: "Original Amount",
			dataIndex: "originalAmount",
			key: "originalAmount",
			render: (amount: number) => formatCurrency(amount),
		},
		{
			title: "Settled",
			dataIndex: "settledAmount",
			key: "settledAmount",
			render: (amount: number) => formatCurrency(amount),
		},
		{
			title: "Balance",
			dataIndex: "balanceAmount",
			key: "balanceAmount",
			render: (amount: number) => (
				<span style={{ fontWeight: "bold", color: amount > 0 ? "#ff4d4f" : "#52c41a" }}>{formatCurrency(amount)}</span>
			),
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status: string) => getStatusTag(status),
		},
		{
			title: "Action",
			key: "action",
			render: (_: any, record: LedgerEntry) => (
				<Space>
					{record.status !== "settled" && (
						<Button type="primary" size="small" onClick={() => handleSettle(record)}>
							Settle Payment
						</Button>
					)}
				</Space>
			),
		},
	];

	if (isLoading) {
		return (
			<div style={{ padding: 24 }}>
				<Card loading />
			</div>
		);
	}

	if (!summary) {
		return (
			<div style={{ padding: 24 }}>
				<Empty description="No ledger data available" />
			</div>
		);
	}

	return (
		<div style={{ padding: 24 }}>
			<h1 style={{ marginBottom: 24 }}>Ledger (Bahikhata)</h1>

			{/* Summary Cards */}
			<Row gutter={16} style={{ marginBottom: 24 }}>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic
							title="Total Receivable"
							value={summary.summary.totalReceivable}
							precision={2}
							prefix="₹"
							valueStyle={{ color: "#52c41a" }}
							suffix={
								<Badge
									count={summary.summary.totalReceivableCount}
									style={{ backgroundColor: "#52c41a", marginLeft: 8 }}
								/>
							}
						/>
						<div style={{ marginTop: 8, fontSize: 12, color: "#8c8c8c" }}>Amount to receive</div>
					</Card>
				</Col>

				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic
							title="Total Payable"
							value={summary.summary.totalPayable}
							precision={2}
							prefix="₹"
							valueStyle={{ color: "#ff4d4f" }}
							suffix={
								<Badge
									count={summary.summary.totalPayableCount}
									style={{ backgroundColor: "#ff4d4f", marginLeft: 8 }}
								/>
							}
						/>
						<div style={{ marginTop: 8, fontSize: 12, color: "#8c8c8c" }}>Amount to pay</div>
					</Card>
				</Col>

				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic
							title="Net Position"
							value={summary.summary.netPosition}
							precision={2}
							prefix="₹"
							valueStyle={{
								color: summary.summary.netPosition >= 0 ? "#52c41a" : "#ff4d4f",
							}}
						/>
						<div style={{ marginTop: 8, fontSize: 12, color: "#8c8c8c" }}>
							{summary.summary.netPosition >= 0 ? "Net Receivable" : "Net Payable"}
						</div>
					</Card>
				</Col>

				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic
							title="Total Entries"
							value={summary.summary.totalReceivableCount + summary.summary.totalPayableCount}
							prefix={<DollarOutlined />}
						/>
						<div style={{ marginTop: 8, fontSize: 12, color: "#8c8c8c" }}>Active ledger entries</div>
					</Card>
				</Col>
			</Row>

			{/* Tabs for Receivables and Payables */}
			<Card>
				<Tabs defaultActiveKey="receivables">
					<TabPane
						tab={
							<span>
								<CheckCircleOutlined />
								Receivables ({summary.receivables.length})
							</span>
						}
						key="receivables"
					>
						{summary.receivables.length > 0 ? (
							<Table
								columns={columns}
								dataSource={summary.receivables}
								rowKey="_id"
								pagination={{ pageSize: 10 }}
								scroll={{ x: true }}
							/>
						) : (
							<Empty description="No receivables" />
						)}
					</TabPane>

					<TabPane
						tab={
							<span>
								<ClockCircleOutlined />
								Payables ({summary.payables.length})
							</span>
						}
						key="payables"
					>
						{summary.payables.length > 0 ? (
							<Table
								columns={columns}
								dataSource={summary.payables}
								rowKey="_id"
								pagination={{ pageSize: 10 }}
								scroll={{ x: true }}
							/>
						) : (
							<Empty description="No payables" />
						)}
					</TabPane>
				</Tabs>
			</Card>

			{/* Settlement Dialog */}
			<SettlementDialog visible={settlementVisible} ledgerEntry={selectedEntry} onClose={handleCloseSettlement} />
		</div>
	);
};

export default LedgerList;
