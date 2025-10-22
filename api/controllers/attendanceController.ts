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
};
