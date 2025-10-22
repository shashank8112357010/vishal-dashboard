import type { Request, Response } from "express";
import Employee from "../models/Employee.js";

export const employeeController = {
	async getAll(_req: Request, res: Response) {
		const employees = await Employee.find().sort({ createdAt: -1 });
		res.json(employees);
	},

	async getById(req: Request, res: Response) {
		const employee = await Employee.findById(req.params.id);
		if (!employee) {
			return res.status(404).json({ error: "Employee not found" });
		}
		res.json(employee);
	},

	async create(req: Request, res: Response) {
		const employee = new Employee(req.body);
		await employee.save();
		res.status(201).json(employee);
	},

	async update(req: Request, res: Response) {
		const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
		if (!employee) {
			return res.status(404).json({ error: "Employee not found" });
		}
		res.json(employee);
	},

	async delete(req: Request, res: Response) {
		const employee = await Employee.findByIdAndDelete(req.params.id);
		if (!employee) {
			return res.status(404).json({ error: "Employee not found" });
		}
		res.status(204).send();
	},
};
