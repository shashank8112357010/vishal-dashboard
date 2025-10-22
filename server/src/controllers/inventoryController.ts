import type { Request, Response } from "express";
import { Inventory } from "../models/Inventory.js";
import { StockHistory } from "../models/StockHistory.js";

export const inventoryController = {
	async getAll(_req: Request, res: Response) {
		const inventory = await Inventory.find().populate("partyId").sort({ createdAt: -1 });
		res.json(inventory);
	},

	async getById(req: Request, res: Response) {
		const item = await Inventory.findById(req.params.id).populate("partyId");
		if (!item) {
			return res.status(404).json({ error: "Item not found" });
		}
		res.json(item);
	},

	async create(req: Request, res: Response) {
		const item = new Inventory(req.body);
		await item.save();

		// Create initial stock history
		await StockHistory.create({
			itemId: item._id,
			change: item.quantityAvailable,
			reason: "Initial stock",
			previousQty: 0,
			newQty: item.quantityAvailable,
			date: new Date(),
		});

		res.status(201).json(item);
	},

	async update(req: Request, res: Response) {
		const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
		if (!item) {
			return res.status(404).json({ error: "Item not found" });
		}
		res.json(item);
	},

	async delete(req: Request, res: Response) {
		const item = await Inventory.findByIdAndDelete(req.params.id);
		if (!item) {
			return res.status(404).json({ error: "Item not found" });
		}
		res.status(204).send();
	},

	async adjustStock(req: Request, res: Response) {
		const { itemId, adjustment, reason } = req.body;

		const item = await Inventory.findById(itemId);
		if (!item) {
			return res.status(404).json({ error: "Item not found" });
		}

		const previousQty = item.quantityAvailable;
		const newQty = previousQty + adjustment;

		if (newQty < 0) {
			return res.status(400).json({ error: "Insufficient stock" });
		}

		item.quantityAvailable = newQty;
		await item.save();

		await StockHistory.create({
			itemId: item._id,
			change: adjustment,
			reason,
			previousQty,
			newQty,
			date: new Date(),
		});

		res.json(item);
	},
};
