import mongoose, { type Document, Schema } from "mongoose";

export interface IParty extends Document {
	partyName: string;
	partyType: "creditor" | "debtor";
	phoneNumber: string;
	state: string;
	city: string;
	gstNumber?: string;
	address: string;
	balanceAmount: number;
	transactions: mongoose.Types.ObjectId[];
	createdAt: Date;
	updatedAt: Date;
}

const PartySchema = new Schema<IParty>(
	{
		partyName: { type: String, required: true },
		partyType: { type: String, enum: ["creditor", "debtor"], required: true },
		phoneNumber: { type: String, required: true },
		state: { type: String, required: true },
		city: { type: String, required: true },
		gstNumber: { type: String },
		address: { type: String, required: true },
		balanceAmount: { type: Number, default: 0 },
		transactions: [{ type: Schema.Types.ObjectId, ref: "Invoice" }],
	},
	{
		timestamps: true,
	},
);

export const Party = mongoose.model<IParty>("Party", PartySchema);
