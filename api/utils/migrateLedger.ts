import mongoose from "mongoose";
import dotenv from "dotenv";
import { Invoice } from "../models/Invoice.js";
import { Ledger } from "../models/Ledger.js";
import type { IParty } from "../models/Party.js";
import { Party } from "../models/Party.js";

dotenv.config();

// Initialize models (to register them with mongoose)
Party;

async function migrateLedger() {
	try {
		const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/bicycle-shop";
		await mongoose.connect(mongoUri);
		console.log("MongoDB connected successfully");

		// Get all existing invoices
		const invoices = await Invoice.find().populate("partyId");
		console.log(`Found ${invoices.length} invoices to migrate`);

		let created = 0;
		let skipped = 0;

		for (const invoice of invoices) {
			// Check if ledger entry already exists
			const existingLedger = await Ledger.findOne({ invoiceId: invoice._id });
			if (existingLedger) {
				console.log(`Skipping invoice ${invoice.invoiceNumber} - ledger entry already exists`);
				skipped++;
				continue;
			}

			// Type guard to check if partyId is populated
			if (
				!invoice.partyId ||
				typeof invoice.partyId === "string" ||
				invoice.partyId instanceof mongoose.Types.ObjectId
			) {
				console.log(`Skipping invoice ${invoice.invoiceNumber} - party not populated`);
				skipped++;
				continue;
			}

			const party = invoice.partyId as unknown as IParty;

			// Create ledger entry
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

			await ledgerEntry.save();
			console.log(`✓ Created ledger entry for invoice ${invoice.invoiceNumber}`);
			created++;
		}

		console.log("\n=== Migration Complete ===");
		console.log(`Created: ${created} ledger entries`);
		console.log(`Skipped: ${skipped} invoices`);
		console.log(`Total: ${invoices.length} invoices processed`);

		await mongoose.disconnect();
		process.exit(0);
	} catch (error) {
		console.error("Migration failed:", error);
		await mongoose.disconnect();
		process.exit(1);
	}
}

migrateLedger();
