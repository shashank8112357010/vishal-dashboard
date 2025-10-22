import mongoose, { type Document, Schema } from "mongoose";

export interface IInvoiceItem {
	itemId: mongoose.Types.ObjectId;
	quantity: number;
	pricePerUnit: number;
	totalAmount: number;
}

export interface IInvoice extends Document {
	invoiceNumber: string;
	date: Date;
	partyId: mongoose.Types.ObjectId;
	customerId?: mongoose.Types.ObjectId;
	items: IInvoiceItem[];
	invoiceType: "purchase" | "sale";
	paymentStatus: "pending" | "partial" | "paid";
	paymentMode?: "cash" | "online" | "both";
	totalAmount: number;
	balanceAmount: number;
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>({
	itemId: { type: Schema.Types.ObjectId, ref: "Inventory", required: true },
	quantity: { type: Number, required: true },
	pricePerUnit: { type: Number, required: true },
	totalAmount: { type: Number, required: true },
});

const InvoiceSchema = new Schema<IInvoice>(
	{
		invoiceNumber: { type: String, required: true, unique: true },
		date: { type: Date, default: Date.now },
		partyId: { type: Schema.Types.ObjectId, ref: "Party", required: true },
		customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
		items: { type: [InvoiceItemSchema], required: true },
		invoiceType: { type: String, enum: ["purchase", "sale"], required: true },
		paymentStatus: {
			type: String,
			enum: ["pending", "partial", "paid"],
			default: "pending",
		},
		paymentMode: {
			type: String,
			enum: ["cash", "online", "both"],
		},
		totalAmount: { type: Number, required: true },
		balanceAmount: { type: Number, required: true },
		notes: { type: String },
	},
	{
		timestamps: true,
	},
);

export const Invoice = mongoose.model<IInvoice>("Invoice", InvoiceSchema);
