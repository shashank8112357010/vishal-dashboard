import mongoose, { type Document, Schema } from "mongoose";

export interface IStockHistory extends Document {
	itemId: mongoose.Types.ObjectId;
	change: number;
	reason: string;
	previousQty: number;
	newQty: number;
	date: Date;
	createdAt: Date;
	updatedAt: Date;
}

const StockHistorySchema = new Schema<IStockHistory>(
	{
		itemId: { type: Schema.Types.ObjectId, ref: "Inventory", required: true },
		change: { type: Number, required: true },
		reason: { type: String, required: true },
		previousQty: { type: Number, required: true },
		newQty: { type: Number, required: true },
		date: { type: Date, default: Date.now },
	},
	{
		timestamps: true,
	},
);

export const StockHistory = mongoose.model<IStockHistory>("StockHistory", StockHistorySchema);
