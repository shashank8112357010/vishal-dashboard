import mongoose, { Schema, type Document } from "mongoose";

export interface ICustomer extends Document {
	customerName: string;
	phone: string;
	email?: string;
	address?: string;
	birthday?: Date;
	children?: string[];
	newsletter: boolean;
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
	{
		customerName: {
			type: String,
			required: [true, "Customer name is required"],
			trim: true,
		},
		phone: {
			type: String,
			required: [true, "Phone number is required"],
			trim: true,
			index: true, // Indexed for quick search
		},
		email: {
			type: String,
			trim: true,
			lowercase: true,
		},
		address: {
			type: String,
			trim: true,
			index: true, // Indexed for quick search
		},
		birthday: {
			type: Date,
		},
		children: {
			type: [String],
			default: [],
		},
		newsletter: {
			type: Boolean,
			default: false,
		},
		notes: {
			type: String,
			trim: true,
		},
	},
	{
		timestamps: true,
	},
);

// Create text index for search functionality
customerSchema.index({ customerName: "text", phone: "text", address: "text" });

const Customer = mongoose.model<ICustomer>("Customer", customerSchema);

export default Customer;
