import mongoose, { type Document, Schema } from "mongoose";

export interface IPayroll extends Document {
	employeeId: Schema.Types.ObjectId | string;
	month: number; // 1-12
	year: number;
	baseSalary: number;
	allowances: number;
	deductions: number;
	bonus: number;
	netSalary: number;
	workingDays: number;
	presentDays: number;
	paidDays: number;
	paymentStatus: "pending" | "paid";
	paymentDate?: Date;
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

const payrollSchema = new Schema<IPayroll>(
	{
		employeeId: {
			type: Schema.Types.ObjectId,
			ref: "Employee",
			required: [true, "Employee ID is required"],
		},
		month: {
			type: Number,
			required: [true, "Month is required"],
			min: [1, "Month must be between 1 and 12"],
			max: [12, "Month must be between 1 and 12"],
		},
		year: {
			type: Number,
			required: [true, "Year is required"],
		},
		baseSalary: {
			type: Number,
			required: [true, "Base salary is required"],
			min: [0, "Base salary cannot be negative"],
		},
		allowances: {
			type: Number,
			default: 0,
			min: [0, "Allowances cannot be negative"],
		},
		deductions: {
			type: Number,
			default: 0,
			min: [0, "Deductions cannot be negative"],
		},
		bonus: {
			type: Number,
			default: 0,
			min: [0, "Bonus cannot be negative"],
		},
		netSalary: {
			type: Number,
			required: [true, "Net salary is required"],
			min: [0, "Net salary cannot be negative"],
		},
		workingDays: {
			type: Number,
			required: [true, "Working days is required"],
			min: [0, "Working days cannot be negative"],
		},
		presentDays: {
			type: Number,
			required: [true, "Present days is required"],
			min: [0, "Present days cannot be negative"],
		},
		paidDays: {
			type: Number,
			required: [true, "Paid days is required"],
			min: [0, "Paid days cannot be negative"],
		},
		paymentStatus: {
			type: String,
			enum: ["pending", "paid"],
			default: "pending",
		},
		paymentDate: {
			type: Date,
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

// Create compound index to ensure one payroll record per employee per month/year
payrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

// Calculate net salary before saving
payrollSchema.pre("save", function (next) {
	this.netSalary = this.baseSalary + this.allowances + this.bonus - this.deductions;
	next();
});

const Payroll = mongoose.model<IPayroll>("Payroll", payrollSchema);

export default Payroll;
