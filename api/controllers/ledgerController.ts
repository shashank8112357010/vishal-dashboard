import type { Request, Response } from "express";
import { Invoice } from "../models/Invoice.js";
import { Ledger } from "../models/Ledger.js";

export const ledgerController = {
	// Get all ledger entries with optional filters
	async getAll(req: Request, res: Response) {
		const { transactionType, status, partyId, customerId } = req.query;
		const query: any = {};

		if (transactionType) {
			query.transactionType = transactionType;
		}

		if (status) {
			query.status = status;
		}

		if (partyId) {
			query.partyId = partyId;
		}

		if (customerId) {
			query.customerId = customerId;
		}

		const ledgerEntries = await Ledger.find(query)
			.populate("partyId")
			.populate("customerId")
			.populate("invoiceId")
			.sort({ createdAt: -1 });

		res.json(ledgerEntries);
	},

	// Get ledger entry by ID
	async getById(req: Request, res: Response) {
		const ledgerEntry = await Ledger.findById(req.params.id)
			.populate("partyId")
			.populate("customerId")
			.populate("invoiceId");

		if (!ledgerEntry) {
			return res.status(404).json({ error: "Ledger entry not found" });
		}

		res.json(ledgerEntry);
	},

	// Create a new ledger entry
	async create(req: Request, res: Response) {
		const ledgerEntry = new Ledger(req.body);
		await ledgerEntry.save();
		res.status(201).json(ledgerEntry);
	},

	// Add a settlement/payment to a ledger entry
	async addSettlement(req: Request, res: Response) {
		const { id } = req.params;
		const { amount, mode, notes } = req.body;

		if (!amount || amount <= 0) {
			return res.status(400).json({ error: "Invalid settlement amount" });
		}

		const ledgerEntry = await Ledger.findById(id);

		if (!ledgerEntry) {
			return res.status(404).json({ error: "Ledger entry not found" });
		}

		if (ledgerEntry.status === "settled") {
			return res.status(400).json({ error: "This entry is already fully settled" });
		}

		// Check if settlement amount exceeds balance
		if (amount > ledgerEntry.balanceAmount) {
			return res.status(400).json({
				error: `Settlement amount (${amount}) exceeds balance (${ledgerEntry.balanceAmount})`,
			});
		}

		// Add settlement
		ledgerEntry.settlements.push({
			date: new Date(),
			amount,
			mode: mode || "cash",
			notes,
		});

		// Update settled amount and balance
		ledgerEntry.settledAmount += amount;
		ledgerEntry.balanceAmount -= amount;

		// Update status
		if (ledgerEntry.balanceAmount === 0) {
			ledgerEntry.status = "settled";
		} else if (ledgerEntry.settledAmount > 0) {
			ledgerEntry.status = "partial";
		}

		await ledgerEntry.save();

		// Update related invoice payment status if exists
		if (ledgerEntry.invoiceId) {
			const invoice = await Invoice.findById(ledgerEntry.invoiceId);
			if (invoice) {
				invoice.balanceAmount = ledgerEntry.balanceAmount;
				if (ledgerEntry.status === "settled") {
					invoice.paymentStatus = "paid";
				} else if (ledgerEntry.status === "partial") {
					invoice.paymentStatus = "partial";
				}
				await invoice.save();
			}
		}

		res.json(ledgerEntry);
	},

	// Get summary of receivables and payables
	async getSummary(_req: Request, res: Response) {
		// Get all receivables (who owes us)
		const receivables = await Ledger.find({
			transactionType: "receivable",
			status: { $in: ["pending", "partial"] },
		})
			.populate("partyId")
			.populate("customerId")
			.populate("invoiceId");

		// Get all payables (who we owe)
		const payables = await Ledger.find({
			transactionType: "payable",
			status: { $in: ["pending", "partial"] },
		})
			.populate("partyId")
			.populate("customerId")
			.populate("invoiceId");

		// Calculate totals
		const totalReceivable = receivables.reduce((sum, entry) => sum + entry.balanceAmount, 0);
		const totalPayable = payables.reduce((sum, entry) => sum + entry.balanceAmount, 0);

		res.json({
			receivables,
			payables,
			summary: {
				totalReceivable,
				totalPayable,
				netPosition: totalReceivable - totalPayable,
				totalReceivableCount: receivables.length,
				totalPayableCount: payables.length,
			},
		});
	},

	// Delete a ledger entry (admin only)
	async delete(req: Request, res: Response) {
		const ledgerEntry = await Ledger.findByIdAndDelete(req.params.id);

		if (!ledgerEntry) {
			return res.status(404).json({ error: "Ledger entry not found" });
		}

		res.status(204).send();
	},
};
