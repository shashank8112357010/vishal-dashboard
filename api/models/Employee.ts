import mongoose, { type Document, Schema } from "mongoose";

export interface IEmployee extends Document {
	employeeId: string;
	name: string;
	email: string;
	phoneNumber: string;
	address: string;
	dateOfJoining: Date;
	position: string;
	department: string;
	salary: number;
	status: "active" | "inactive" | "on_leave";
	createdAt: Date;
	updatedAt: Date;
}

const employeeSchema = new Schema<IEmployee>(
	{
		employeeId: {
			type: String,
			required: [true, "Employee ID is required"],
			unique: true,
			trim: true,
		},
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			trim: true,
			lowercase: true,
			match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
		},
		phoneNumber: {
			type: String,
			required: [true, "Phone number is required"],
			trim: true,
		},
		address: {
			type: String,
			required: [true, "Address is required"],
			trim: true,
		},
		dateOfJoining: {
			type: Date,
			required: [true, "Date of joining is required"],
		},
		position: {
			type: String,
			required: [true, "Position is required"],
			trim: true,
		},
		department: {
			type: String,
			required: [true, "Department is required"],
			trim: true,
		},
		salary: {
			type: Number,
			required: [true, "Salary is required"],
			min: [0, "Salary cannot be negative"],
		},
		status: {
			type: String,
			enum: ["active", "inactive", "on_leave"],
			default: "active",
		},
	},
	{
		timestamps: true,
	},
);

const Employee = mongoose.model<IEmployee>("Employee", employeeSchema);

export default Employee;
