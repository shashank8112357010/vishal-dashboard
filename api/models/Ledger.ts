import mongoose, { type Document, Schema } from "mongoose";

export interface ISettlement {
	date: Date;
	amount: number;
	mode: "cash" | "online" | "both";
	notes?: string;
}

export interface ILedgerEntry extends Document {
	partyId: mongoose.Types.ObjectId;
	customerId?: mongoose.Types.ObjectId;
	invoiceId?: mongoose.Types.ObjectId;
	transactionType: "receivable" | "payable";
	originalAmount: number;
	settledAmount: number;
	balanceAmount: number;
	description: string;
	settlements: ISettlement[];
	status: "pending" | "partial" | "settled";
	createdAt: Date;
	updatedAt: Date;
}

const SettlementSchema = new Schema<ISettlement>(
	{
		date: { type: Date, default: Date.now },
		amount: { type: Number, required: true },
		mode: { type: String, enum: ["cash", "online", "both"], required: true },
		notes: { type: String },
	},
	{ _id: false },
);

const LedgerSchema = new Schema<ILedgerEntry>(
	{
		partyId: { type: Schema.Types.ObjectId, ref: "Party", required: true },
		customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
		invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice" },
		transactionType: {
			type: String,
			enum: ["receivable", "payable"],
			required: true,
		},
		originalAmount: { type: Number, required: true },
		settledAmount: { type: Number, default: 0 },
		balanceAmount: { type: Number, required: true },
		description: { type: String, required: true },
		settlements: { type: [SettlementSchema], default: [] },
		status: {
			type: String,
			enum: ["pending", "partial", "settled"],
			default: "pending",
		},
	},
	{
		timestamps: true,
	},
);

// Index for faster queries
LedgerSchema.index({ partyId: 1, status: 1 });
LedgerSchema.index({ customerId: 1, status: 1 });
LedgerSchema.index({ transactionType: 1, status: 1 });

export const Ledger = mongoose.model<ILedgerEntry>("Ledger", LedgerSchema);
