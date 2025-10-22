import mongoose, { type Document, Schema } from "mongoose";

export interface IAttendance extends Document {
	employeeId: Schema.Types.ObjectId | string;
	date: Date;
	checkIn: Date;
	checkOut?: Date;
	status: "present" | "absent" | "half_day" | "on_leave";
	workHours?: number;
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
	{
		employeeId: {
			type: Schema.Types.ObjectId,
			ref: "Employee",
			required: [true, "Employee ID is required"],
		},
		date: {
			type: Date,
			required: [true, "Date is required"],
		},
		checkIn: {
			type: Date,
			required: function (this: IAttendance) {
				return this.status === "present" || this.status === "half_day";
			},
		},
		checkOut: {
			type: Date,
		},
		status: {
			type: String,
			enum: ["present", "absent", "half_day", "on_leave"],
			required: [true, "Status is required"],
		},
		workHours: {
			type: Number,
			min: [0, "Work hours cannot be negative"],
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

// Create compound index to ensure one attendance record per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// Calculate work hours before saving
attendanceSchema.pre("save", function (next) {
	if (this.checkIn && this.checkOut) {
		const hours = (this.checkOut.getTime() - this.checkIn.getTime()) / (1000 * 60 * 60);
		this.workHours = Number(hours.toFixed(2));
	}
	next();
});

const Attendance = mongoose.model<IAttendance>("Attendance", attendanceSchema);

export default Attendance;
