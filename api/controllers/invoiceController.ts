import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Inventory } from "../models/Inventory.js";
import { type IInvoice, Invoice } from "../models/Invoice.js";
import { Ledger } from "../models/Ledger.js";
import { Party } from "../models/Party.js";
import { StockHistory } from "../models/StockHistory.js";

export const invoiceController = {
	async getAll(_req: Request, res: Response) {
		const invoices = await Invoice.find().populate("partyId").populate("items.itemId").sort({ createdAt: -1 });
		res.json(invoices);
	},

	async getById(req: Request, res: Response) {
		const invoice = await Invoice.findById(req.params.id).populate("partyId").populate("items.itemId");
		if (!invoice) {
			return res.status(404).json({ error: "Invoice not found" });
		}
		res.json(invoice);
	},

	async create(req: Request, res: Response) {
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			const invoiceData: IInvoice = req.body;
			const invoice = new Invoice(invoiceData);

			// Update stock for each item
			for (const item of invoice.items) {
				const stock = await Inventory.findById(item.itemId).session(session);
				if (!stock) {
					throw new Error(`Item not found: ${item.itemId}`);
				}

				const prev = stock.quantityAvailable;

				if (invoice.invoiceType === "purchase") {
					stock.quantityAvailable += item.quantity;
				} else {
					if (stock.quantityAvailable < item.quantity) {
						throw new Error(
							`Insufficient stock for ${stock.itemName}. Available: ${stock.quantityAvailable}, Required: ${item.quantity}`,
						);
					}
					stock.quantityAvailable -= item.quantity;
				}

				await stock.save({ session });

				// Create stock history
				await StockHistory.create(
					[
						{
							itemId: stock._id,
							change: invoice.invoiceType === "purchase" ? item.quantity : -item.quantity,
							reason: `${invoice.invoiceType} Invoice #${invoice.invoiceNumber}`,
							previousQty: prev,
							newQty: stock.quantityAvailable,
							date: new Date(),
						},
					],
					{ session },
				);
			}

			// Update party balance
			const party = await Party.findById(invoice.partyId).session(session);
			if (!party) {
				throw new Error("Party not found");
			}

			party.balanceAmount += invoice.totalAmount;
			party.transactions.push(invoice._id as mongoose.Types.ObjectId);
			await party.save({ session });

			await invoice.save({ session });

			// Create ledger entry for receivables/payables tracking
			const transactionType = invoice.invoiceType === "sale" ? "receivable" : "payable";
			const description = `Invoice #${invoice.invoiceNumber} - ${invoice.invoiceType === "sale" ? "Sale to" : "Purchase from"} ${party.partyName}`;

			const ledgerEntry = new Ledger({
				partyId: invoice.partyId,
				customerId: invoice.customerId,
				invoiceId: invoice._id,
				transactionType,
				originalAmount: invoice.totalAmount,
				settledAmount: invoice.paymentStatus === "paid" ? invoice.totalAmount : 0,
				balanceAmount: invoice.balanceAmount,
				description,
				status:
					invoice.paymentStatus === "paid" ? "settled" : invoice.paymentStatus === "partial" ? "partial" : "pending",
			});

			await ledgerEntry.save({ session });
			await session.commitTransaction();

			const savedInvoice = await Invoice.findById(invoice._id).populate("partyId").populate("items.itemId");

			res.status(201).json(savedInvoice);
		} catch (error) {
			await session.abortTransaction();
			res.status(400).json({ error: (error as Error).message });
		} finally {
			session.endSession();
		}
	},

	async update(req: Request, res: Response) {
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			const existingInvoice = await Invoice.findById(req.params.id).session(session);
			if (!existingInvoice) {
				throw new Error("Invoice not found");
			}

			// Reverse existing stock changes
			for (const item of existingInvoice.items) {
				const stock = await Inventory.findById(item.itemId).session(session);
				if (!stock) continue;

				const prev = stock.quantityAvailable;
				const reverseChange = existingInvoice.invoiceType === "purchase" ? -item.quantity : item.quantity;
				stock.quantityAvailable += reverseChange;
				await stock.save({ session });

				await StockHistory.create(
					[
						{
							itemId: stock._id,
							change: reverseChange,
							reason: `Reversed ${existingInvoice.invoiceType} Invoice #${existingInvoice.invoiceNumber}`,
							previousQty: prev,
							newQty: stock.quantityAvailable,
							date: new Date(),
						},
					],
					{ session },
				);
			}

			// Reverse party balance
			const oldParty = await Party.findById(existingInvoice.partyId).session(session);
			if (oldParty) {
				oldParty.balanceAmount -= existingInvoice.totalAmount;
				await oldParty.save({ session });
			}

			// Apply new changes
			const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
				new: true,
				runValidators: true,
				session,
			});

			if (!updatedInvoice) {
				throw new Error("Failed to update invoice");
			}

			// Apply new stock changes
			for (const item of updatedInvoice.items) {
				const stock = await Inventory.findById(item.itemId).session(session);
				if (!stock) {
					throw new Error(`Item not found: ${item.itemId}`);
				}

				const prev = stock.quantityAvailable;

				if (updatedInvoice.invoiceType === "purchase") {
					stock.quantityAvailable += item.quantity;
				} else {
					if (stock.quantityAvailable < item.quantity) {
						throw new Error(`Insufficient stock for ${stock.itemName}`);
					}
					stock.quantityAvailable -= item.quantity;
				}

				await stock.save({ session });

				await StockHistory.create(
					[
						{
							itemId: stock._id,
							change: updatedInvoice.invoiceType === "purchase" ? item.quantity : -item.quantity,
							reason: `Updated ${updatedInvoice.invoiceType} Invoice #${updatedInvoice.invoiceNumber}`,
							previousQty: prev,
							newQty: stock.quantityAvailable,
							date: new Date(),
						},
					],
					{ session },
				);
			}

			// Update new party balance
			const newParty = await Party.findById(updatedInvoice.partyId).session(session);
			if (newParty) {
				newParty.balanceAmount += updatedInvoice.totalAmount;
				if (!newParty.transactions.includes(updatedInvoice._id as mongoose.Types.ObjectId)) {
					newParty.transactions.push(updatedInvoice._id as mongoose.Types.ObjectId);
				}
				await newParty.save({ session });
			}

			// Update ledger entry
			const ledgerEntry = await Ledger.findOne({ invoiceId: updatedInvoice._id }).session(session);
			if (ledgerEntry) {
				const transactionType = updatedInvoice.invoiceType === "sale" ? "receivable" : "payable";
				const description = `Invoice #${updatedInvoice.invoiceNumber} - ${updatedInvoice.invoiceType === "sale" ? "Sale to" : "Purchase from"} ${newParty?.partyName || "Unknown"}`;

				ledgerEntry.transactionType = transactionType;
				ledgerEntry.originalAmount = updatedInvoice.totalAmount;
				ledgerEntry.balanceAmount = updatedInvoice.balanceAmount;
				ledgerEntry.description = description;
				ledgerEntry.status =
					updatedInvoice.paymentStatus === "paid"
						? "settled"
						: updatedInvoice.paymentStatus === "partial"
							? "partial"
							: "pending";

				await ledgerEntry.save({ session });
			}

			await session.commitTransaction();

			const result = await Invoice.findById(updatedInvoice._id).populate("partyId").populate("items.itemId");

			res.json(result);
		} catch (error) {
			await session.abortTransaction();
			res.status(400).json({ error: (error as Error).message });
		} finally {
			session.endSession();
		}
	},

	async delete(req: Request, res: Response) {
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			const invoice = await Invoice.findById(req.params.id).session(session);
			if (!invoice) {
				throw new Error("Invoice not found");
			}

			// Reverse stock changes
			for (const item of invoice.items) {
				const stock = await Inventory.findById(item.itemId).session(session);
				if (!stock) continue;

				const prev = stock.quantityAvailable;
				const reverseChange = invoice.invoiceType === "purchase" ? -item.quantity : item.quantity;
				stock.quantityAvailable += reverseChange;
				await stock.save({ session });

				await StockHistory.create(
					[
						{
							itemId: stock._id,
							change: reverseChange,
							reason: `Deleted ${invoice.invoiceType} Invoice #${invoice.invoiceNumber}`,
							previousQty: prev,
							newQty: stock.quantityAvailable,
							date: new Date(),
						},
					],
					{ session },
				);
			}

			// Reverse party balance
			const party = await Party.findById(invoice.partyId).session(session);
			if (party) {
				party.balanceAmount -= invoice.totalAmount;
				party.transactions = party.transactions.filter((t) => !t.equals(invoice._id as mongoose.Types.ObjectId));
				await party.save({ session });
			}

			// Delete associated ledger entry
			await Ledger.deleteOne({ invoiceId: invoice._id }).session(session);

			await invoice.deleteOne({ session });
			await session.commitTransaction();

			res.status(204).send();
		} catch (error) {
			await session.abortTransaction();
			res.status(400).json({ error: (error as Error).message });
		} finally {
			session.endSession();
		}
	},
};
