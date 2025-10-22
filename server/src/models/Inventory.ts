import mongoose, { type Document, Schema } from "mongoose";

export interface IInventory extends Document {
	itemName: string;
	category: "bicycle" | "spare_part";
	unitType: "piece" | "set" | "pair" | "dozen" | "packet";
	bundleCount: number;
	quantityAvailable: number;
	stockType: "loose" | "fitted";
	purchasePrice: number;
	sellingPrice: number;
	lastBorrowedDate?: Date;
	partyId?: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
	{
		itemName: { type: String, required: true },
		category: { type: String, enum: ["bicycle", "spare_part"], required: true },
		unitType: {
			type: String,
			enum: ["piece", "set", "pair", "dozen", "packet"],
			required: true,
		},
		bundleCount: { type: Number, default: 1 },
		quantityAvailable: { type: Number, default: 0 },
		stockType: { type: String, enum: ["loose", "fitted"], required: true },
		purchasePrice: { type: Number, required: true },
		sellingPrice: { type: Number, required: true },
		lastBorrowedDate: { type: Date },
		partyId: { type: Schema.Types.ObjectId, ref: "Party" },
	},
	{
		timestamps: true,
	},
);

export const Inventory = mongoose.model<IInventory>("Inventory", InventorySchema);
