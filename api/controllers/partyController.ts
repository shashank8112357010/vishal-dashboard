import type { Request, Response } from "express";
import { Party } from "../models/Party.js";

export const partyController = {
	async getAll(_req: Request, res: Response) {
		const parties = await Party.find().sort({ createdAt: -1 });
		res.json(parties);
	},

	async getById(req: Request, res: Response) {
		const party = await Party.findById(req.params.id).populate("transactions");
		if (!party) {
			return res.status(404).json({ error: "Party not found" });
		}
		res.json(party);
	},

	async create(req: Request, res: Response) {
		const party = new Party(req.body);
		await party.save();
		res.status(201).json(party);
	},

	async update(req: Request, res: Response) {
		const party = await Party.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
		if (!party) {
			return res.status(404).json({ error: "Party not found" });
		}
		res.json(party);
	},

	async delete(req: Request, res: Response) {
		const party = await Party.findByIdAndDelete(req.params.id);
		if (!party) {
			return res.status(404).json({ error: "Party not found" });
		}
		res.status(204).send();
	},
};
