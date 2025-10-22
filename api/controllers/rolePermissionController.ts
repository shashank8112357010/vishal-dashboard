import type { Request, Response } from "express";
import RolePermission from "../models/RolePermission.js";

export const rolePermissionController = {
	async getAll(_req: Request, res: Response) {
		const rolePermissions = await RolePermission.find();
		res.json(rolePermissions);
	},

	async getByRole(req: Request, res: Response) {
		const rolePermission = await RolePermission.findOne({ role: req.params.role });
		if (!rolePermission) {
			return res.status(404).json({ error: "Role permission not found" });
		}
		res.json(rolePermission);
	},

	async createOrUpdate(req: Request, res: Response) {
		const { role, permissions } = req.body;
		const rolePermission = await RolePermission.findOneAndUpdate(
			{ role },
			{ role, permissions },
			{ new: true, upsert: true, runValidators: true },
		);
		res.json(rolePermission);
	},

	async delete(req: Request, res: Response) {
		const rolePermission = await RolePermission.findOneAndDelete({ role: req.params.role });
		if (!rolePermission) {
			return res.status(404).json({ error: "Role permission not found" });
		}
		res.status(204).send();
	},
};
