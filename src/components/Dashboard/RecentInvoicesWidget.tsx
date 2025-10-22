import { FileTextOutlined } from "@ant-design/icons";
import { Button, Card, List, Tag } from "antd";
import dayjs from "dayjs";
import type React from "react";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import type { Invoice, Party } from "@/types/entity";
import { formatCurrency } from "@/utils/format-number";

const RecentInvoicesWidget: React.FC = () => {
	const { recentInvoices } = useInvoiceStore();

	return (
		<Card
			title={
				<span>
					<FileTextOutlined style={{ marginRight: 8 }} />
					Recent Invoices
				</span>
			}
			size="small"
			extra={
				<Button type="link" size="small">
					View All
				</Button>
			}
		>
			<List
				dataSource={recentInvoices.slice(0, 5)}
				renderItem={(invoice: Invoice) => {
					const party = invoice.partyId as Party;
					return (
						<List.Item>
							<div style={{ width: "100%" }}>
								<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
									<span style={{ fontWeight: 500 }}>{invoice.invoiceNumber}</span>
									<Tag color={invoice.invoiceType === "purchase" ? "red" : "green"}>
										{invoice.invoiceType.toUpperCase()}
									</Tag>
								</div>
								<div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#666" }}>
									<span>{party?.partyName || "N/A"}</span>
									<span>{dayjs(invoice.date).format("DD/MM/YY")}</span>
								</div>
								<div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
									<span style={{ fontSize: "14px", fontWeight: 500 }}>{formatCurrency(invoice.totalAmount)}</span>
									<Tag
										color={
											invoice.paymentStatus === "paid"
												? "green"
												: invoice.paymentStatus === "partial"
													? "blue"
													: "orange"
										}
										size="small"
									>
										{invoice.paymentStatus.toUpperCase()}
									</Tag>
								</div>
							</div>
						</List.Item>
					);
				}}
			/>
		</Card>
	);
};

export default RecentInvoicesWidget;
