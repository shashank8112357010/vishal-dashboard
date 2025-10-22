import {
	CheckCircleOutlined,
	ClockCircleOutlined,
	DollarOutlined,
	FallOutlined,
	FileTextOutlined,
	RiseOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Empty, Row, Space, Table, Tabs, Tag } from "antd";
import type React from "react";
import { useMemo, useState } from "react";
import { EnhancedStatsCard } from "@/components/Dashboard";
import { useLedgerSummary } from "@/services/ledgerService";
import type { LedgerEntry } from "@/types/entity";
import { formatCurrency } from "@/utils/format-number";
import SettlementDialog from "./SettlementDialog";

const { TabPane } = Tabs;

const LedgerList: React.FC = () => {
	const { data: summary, isLoading } = useLedgerSummary();
	const [settlementVisible, setSettlementVisible] = useState(false);
	const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);

	// Generate sparkline data (must be at top level, before any returns)
	const sparklineData = useMemo(
		() =>
			summary
				? [
						summary.summary.totalReceivable * 0.7,
						summary.summary.totalReceivable * 0.8,
						summary.summary.totalReceivable * 0.75,
						summary.summary.totalReceivable * 0.9,
						summary.summary.totalReceivable * 0.85,
						summary.summary.totalReceivable * 0.95,
						summary.summary.totalReceivable,
					]
				: [],
		[summary],
	);

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
			<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
				<Col xs={24} sm={12} lg={6}>
					<EnhancedStatsCard
						title="Total Receivable"
						value={formatCurrency(summary.summary.totalReceivable)}
						icon={<RiseOutlined />}
						iconColor="#52c41a"
						iconBgColor="rgba(82, 196, 26, 0.1)"
						trend={15.6}
						data={sparklineData}
					/>
				</Col>

				<Col xs={24} sm={12} lg={6}>
					<EnhancedStatsCard
						title="Total Payable"
						value={formatCurrency(summary.summary.totalPayable)}
						icon={<FallOutlined />}
						iconColor="#ff4d4f"
						iconBgColor="rgba(255, 77, 79, 0.1)"
						trend={-8.2}
						data={sparklineData.map((v) => v * 0.3)}
					/>
				</Col>

				<Col xs={24} sm={12} lg={6}>
					<EnhancedStatsCard
						title="Net Position"
						value={formatCurrency(summary.summary.netPosition)}
						icon={<DollarOutlined />}
						iconColor={summary.summary.netPosition >= 0 ? "#52c41a" : "#ff4d4f"}
						iconBgColor={summary.summary.netPosition >= 0 ? "rgba(82, 196, 26, 0.1)" : "rgba(255, 77, 79, 0.1)"}
						data={sparklineData}
					/>
				</Col>

				<Col xs={24} sm={12} lg={6}>
					<EnhancedStatsCard
						title="Total Entries"
						value={summary.summary.totalReceivableCount + summary.summary.totalPayableCount}
						icon={<FileTextOutlined />}
						iconColor="#1890ff"
						iconBgColor="rgba(24, 144, 255, 0.1)"
						data={[3, 4, 2, 5, 4, 3, summary.summary.totalReceivableCount + summary.summary.totalPayableCount]}
					/>
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
