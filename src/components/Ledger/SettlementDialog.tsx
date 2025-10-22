import { Form, Input, InputNumber, Modal, Select, message, Alert } from "antd";
import type React from "react";
import { useEffect } from "react";
import { useAddSettlement } from "@/services/ledgerService";
import type { LedgerEntry } from "@/types/entity";
import { formatCurrency } from "@/utils/format-number";

const { Option } = Select;
const { TextArea } = Input;

interface SettlementDialogProps {
	visible: boolean;
	ledgerEntry: LedgerEntry | null;
	onClose: () => void;
}

const SettlementDialog: React.FC<SettlementDialogProps> = ({ visible, ledgerEntry, onClose }) => {
	const [form] = Form.useForm();
	const addSettlementMutation = useAddSettlement();

	useEffect(() => {
		if (visible && ledgerEntry) {
			form.resetFields();
			form.setFieldValue("amount", ledgerEntry.balanceAmount);
		}
	}, [visible, ledgerEntry, form]);

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();

			if (!ledgerEntry) {
				return;
			}

			await addSettlementMutation.mutateAsync({
				id: ledgerEntry._id,
				settlement: values,
			});

			message.success("Settlement recorded successfully");
			onClose();
			form.resetFields();
		} catch (error: any) {
			if (error.response?.data?.error) {
				message.error(error.response.data.error);
			} else {
				console.error("Form validation failed:", error);
			}
		}
	};

	if (!ledgerEntry) {
		return null;
	}

	const partyName =
		typeof ledgerEntry.partyId === "string" ? ledgerEntry.partyId : ledgerEntry.partyId?.partyName || "N/A";

	const transactionLabel = ledgerEntry.transactionType === "receivable" ? "Receiving from" : "Paying to";

	return (
		<Modal
			title="Record Settlement"
			open={visible}
			onOk={handleSubmit}
			onCancel={onClose}
			confirmLoading={addSettlementMutation.isPending}
			width={600}
		>
			<Alert
				message={`${transactionLabel}: ${partyName}`}
				description={
					<div>
						<p>
							<strong>Description:</strong> {ledgerEntry.description}
						</p>
						<p>
							<strong>Original Amount:</strong> {formatCurrency(ledgerEntry.originalAmount)}
						</p>
						<p>
							<strong>Already Settled:</strong> {formatCurrency(ledgerEntry.settledAmount)}
						</p>
						<p>
							<strong>Remaining Balance:</strong>{" "}
							<span style={{ fontWeight: "bold", color: "#ff4d4f" }}>{formatCurrency(ledgerEntry.balanceAmount)}</span>
						</p>
					</div>
				}
				type="info"
				style={{ marginBottom: 16 }}
			/>

			<Form
				form={form}
				layout="vertical"
				initialValues={{
					mode: "cash",
					amount: ledgerEntry.balanceAmount,
				}}
			>
				<Form.Item
					name="amount"
					label="Settlement Amount"
					rules={[
						{ required: true, message: "Please enter settlement amount" },
						{
							validator: (_, value) => {
								if (value > ledgerEntry.balanceAmount) {
									return Promise.reject(`Amount cannot exceed balance of ${formatCurrency(ledgerEntry.balanceAmount)}`);
								}
								if (value <= 0) {
									return Promise.reject("Amount must be greater than 0");
								}
								return Promise.resolve();
							},
						},
					]}
				>
					<InputNumber
						className="w-full"
						placeholder="Enter amount"
						min={0}
						max={ledgerEntry.balanceAmount}
						formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
						parser={(value) => value?.replace(/₹\s?|(,*)/g, "") as any}
					/>
				</Form.Item>

				<Form.Item name="mode" label="Payment Mode" rules={[{ required: true, message: "Please select payment mode" }]}>
					<Select placeholder="Select payment mode">
						<Option value="cash">Cash</Option>
						<Option value="online">Online</Option>
						<Option value="both">Both (Cash + Online)</Option>
					</Select>
				</Form.Item>

				<Form.Item name="notes" label="Notes">
					<TextArea rows={3} placeholder="Add any notes about this settlement (optional)" />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default SettlementDialog;
