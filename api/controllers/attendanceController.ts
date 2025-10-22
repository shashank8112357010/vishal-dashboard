import type { Request, Response } from "express";
import Attendance from "../models/Attendance.js";

export const attendanceController = {
	async getAll(req: Request, res: Response) {
		const { employeeId, startDate, endDate } = req.query;
		const query: any = {};

		if (employeeId) {
			query.employeeId = employeeId;
		}

		if (startDate || endDate) {
			query.date = {};
			if (startDate) query.date.$gte = new Date(startDate as string);
			if (endDate) query.date.$lte = new Date(endDate as string);
		}

		const attendance = await Attendance.find(query).populate("employeeId").sort({ date: -1 });
		res.json(attendance);
	},

	async getById(req: Request, res: Response) {
		const attendance = await Attendance.findById(req.params.id).populate("employeeId");
		if (!attendance) {
			return res.status(404).json({ error: "Attendance record not found" });
		}
		res.json(attendance);
	},

	async create(req: Request, res: Response) {
		const attendance = new Attendance(req.body);
		await attendance.save();
		res.status(201).json(attendance);
	},

	async update(req: Request, res: Response) {
		const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});
		if (!attendance) {
			return res.status(404).json({ error: "Attendance record not found" });
		}
		res.json(attendance);
	},

	async delete(req: Request, res: Response) {
		const attendance = await Attendance.findByIdAndDelete(req.params.id);
		if (!attendance) {
			return res.status(404).json({ error: "Attendance record not found" });
		}
		res.status(204).send();
	},

	// Get attendance summary for payroll calculation
	async getMonthSummary(req: Request, res: Response) {
		const { employeeId, month, year } = req.query;

		if (!employeeId || !month || !year) {
			return res.status(400).json({ error: "employeeId, month, and year are required" });
		}

		const monthNum = Number.parseInt(month as string);
		const yearNum = Number.parseInt(year as string);

		// Get start and end date of the month
		const startDate = new Date(yearNum, monthNum - 1, 1);
		const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

		// Get total working days in month (excluding Sundays)
		let workingDays = 0;
		const currentDate = new Date(startDate);
		while (currentDate <= endDate) {
			if (currentDate.getDay() !== 0) {
				// Not Sunday
				workingDays++;
			}
			currentDate.setDate(currentDate.getDate() + 1);
		}

		// Fetch attendance records for the month
		const attendanceRecords = await Attendance.find({
			employeeId,
			date: { $gte: startDate, $lte: endDate },
		});

		// Calculate attendance metrics
		const presentDays = attendanceRecords.filter((record) => record.status === "present").length;
		const halfDays = attendanceRecords.filter((record) => record.status === "half_day").length;
		const absentDays = attendanceRecords.filter((record) => record.status === "absent").length;
		const leaveDays = attendanceRecords.filter((record) => record.status === "on_leave").length;

		// Calculate paid days (4 holidays/leaves allowed per month)
		const allowedLeaves = 4;
		const excessLeaves = Math.max(0, leaveDays - allowedLeaves);
		const paidDays = presentDays + halfDays * 0.5 + Math.min(leaveDays, allowedLeaves);

		// Calculate deduction percentage
		const expectedDays = workingDays;
		const actualPaidDays = paidDays;
		const unpaidDays = absentDays + excessLeaves;

		res.json({
			workingDays,
			presentDays,
			halfDays,
			absentDays,
			leaveDays,
			allowedLeaves,
			excessLeaves,
			paidDays: actualPaidDays,
			unpaidDays,
			attendancePercentage: expectedDays > 0 ? (actualPaidDays / expectedDays) * 100 : 0,
		});
	},
};
