import type { Request, Response } from "express";
import Payroll from "../models/Payroll.js";

export const payrollController = {
	async getAll(req: Request, res: Response) {
		const { employeeId, month, year } = req.query;
		const query: any = {};

		if (employeeId) {
			query.employeeId = employeeId;
		}
		if (month) {
			query.month = Number(month);
		}
		if (year) {
			query.year = Number(year);
		}

		const payrolls = await Payroll.find(query).populate("employeeId").sort({ year: -1, month: -1 });
		res.json(payrolls);
	},

	async getById(req: Request, res: Response) {
		const payroll = await Payroll.findById(req.params.id).populate("employeeId");
		if (!payroll) {
			return res.status(404).json({ error: "Payroll record not found" });
		}
		res.json(payroll);
	},

	async create(req: Request, res: Response) {
		const payroll = new Payroll(req.body);
		await payroll.save();
		res.status(201).json(payroll);
	},

	async update(req: Request, res: Response) {
		const payroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
		if (!payroll) {
			return res.status(404).json({ error: "Payroll record not found" });
		}
		res.json(payroll);
	},

	async delete(req: Request, res: Response) {
		const payroll = await Payroll.findByIdAndDelete(req.params.id);
		if (!payroll) {
			return res.status(404).json({ error: "Payroll record not found" });
		}
		res.status(204).send();
	},
};
