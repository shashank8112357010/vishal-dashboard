import type mongoose from "mongoose";
import { connectDB } from "../config/database.js";
import { Inventory } from "../models/Inventory.js";
import { Invoice } from "../models/Invoice.js";
import { Party } from "../models/Party.js";
import { StockHistory } from "../models/StockHistory.js";

const sampleParties = [
	{
		partyName: "Cycle World Suppliers",
		partyType: "creditor",
		phoneNumber: "9876543210",
		state: "Maharashtra",
		city: "Mumbai",
		gstNumber: "27ABCDE1234F1Z5",
		address: "123 Industrial Estate, Andheri East, Mumbai",
		balanceAmount: 0,
		transactions: [],
	},
	{
		partyName: "Speed Bikes Ltd",
		partyType: "creditor",
		phoneNumber: "9876543211",
		state: "Karnataka",
		city: "Bangalore",
		address: "456 Tech Park, Whitefield, Bangalore",
		balanceAmount: 0,
		transactions: [],
	},
	{
		partyName: "John Doe",
		partyType: "debtor",
		phoneNumber: "9876543212",
		state: "Delhi",
		city: "New Delhi",
		address: "789 Residential Colony, CP, New Delhi",
		balanceAmount: 0,
		transactions: [],
	},
	{
		partyName: "ABC Retail Store",
		partyType: "debtor",
		phoneNumber: "9876543213",
		state: "Gujarat",
		city: "Ahmedabad",
		gstNumber: "24FGHIJ5678K2L9",
		address: "321 Shopping Complex, Satellite, Ahmedabad",
		balanceAmount: 0,
		transactions: [],
	},
	{
		partyName: "XYZ Sports Equipment",
		partyType: "debtor",
		phoneNumber: "9876543214",
		state: "Tamil Nadu",
		city: "Chennai",
		address: "654 Sports Market, T Nagar, Chennai",
		balanceAmount: 0,
		transactions: [],
	},
];

const sampleInventory = [
	{
		itemName: "Mountain Bike Pro 2024",
		category: "bicycle",
		unitType: "piece",
		bundleCount: 1,
		quantityAvailable: 15,
		stockType: "loose",
		purchasePrice: 25000,
		sellingPrice: 32000,
	},
	{
		itemName: "City Cruiser Deluxe",
		category: "bicycle",
		unitType: "piece",
		bundleCount: 1,
		quantityAvailable: 8,
		stockType: "loose",
		purchasePrice: 18000,
		sellingPrice: 23000,
	},
	{
		itemName: 'Kids Bicycle 16"',
		category: "bicycle",
		unitType: "piece",
		bundleCount: 1,
		quantityAvailable: 12,
		stockType: "loose",
		purchasePrice: 8000,
		sellingPrice: 12000,
	},
	{
		itemName: "Brake Pads Set",
		category: "spare_part",
		unitType: "set",
		bundleCount: 2,
		quantityAvailable: 45,
		stockType: "loose",
		purchasePrice: 250,
		sellingPrice: 400,
	},
	{
		itemName: "Chain 21-Speed",
		category: "spare_part",
		unitType: "piece",
		bundleCount: 1,
		quantityAvailable: 25,
		stockType: "loose",
		purchasePrice: 800,
		sellingPrice: 1200,
	},
	{
		itemName: 'Tire 26" x 2.1',
		category: "spare_part",
		unitType: "pair",
		bundleCount: 2,
		quantityAvailable: 30,
		stockType: "loose",
		purchasePrice: 1500,
		sellingPrice: 2200,
	},
	{
		itemName: "Bicycle Lock Premium",
		category: "spare_part",
		unitType: "piece",
		bundleCount: 1,
		quantityAvailable: 20,
		stockType: "loose",
		purchasePrice: 600,
		sellingPrice: 950,
	},
	{
		itemName: "LED Light Set",
		category: "spare_part",
		unitType: "set",
		bundleCount: 1,
		quantityAvailable: 35,
		stockType: "loose",
		purchasePrice: 400,
		sellingPrice: 650,
	},
	{
		itemName: "Gear Cable Set",
		category: "spare_part",
		unitType: "set",
		bundleCount: 1,
		quantityAvailable: 15,
		stockType: "loose",
		purchasePrice: 300,
		sellingPrice: 500,
	},
	{
		itemName: "Water Bottle Holder",
		category: "spare_part",
		unitType: "piece",
		bundleCount: 1,
		quantityAvailable: 40,
		stockType: "loose",
		purchasePrice: 150,
		sellingPrice: 250,
	},
];

async function seedDatabase() {
	try {
		await connectDB();

		console.log("Clearing existing data...");
		await Party.deleteMany({});
		await Inventory.deleteMany({});
		await Invoice.deleteMany({});
		await StockHistory.deleteMany({});

		console.log("Seeding parties...");
		const parties = await Party.insertMany(sampleParties);

		console.log("Seeding inventory...");
		const inventory = await Inventory.insertMany(sampleInventory);

		// Create stock history for initial inventory
		console.log("Creating initial stock history...");
		const stockHistoryEntries = inventory.map((item) => ({
			itemId: item._id,
			change: item.quantityAvailable,
			reason: "Initial stock",
			previousQty: 0,
			newQty: item.quantityAvailable,
			date: new Date(),
		}));
		await StockHistory.insertMany(stockHistoryEntries);

		// Create some sample invoices
		console.log("Creating sample invoices...");
		const creditor = parties.find((p) => p.partyType === "creditor");
		const debtor = parties.find((p) => p.partyType === "debtor");
		const bike = inventory.find((i) => i.category === "bicycle");
		const sparePart = inventory.find((i) => i.category === "spare_part");

		if (creditor && bike) {
			// Purchase invoice
			const purchaseInvoice = new Invoice({
				invoiceNumber: "INV-20241018-001",
				date: new Date(),
				partyId: creditor._id,
				items: [
					{
						itemId: bike._id,
						quantity: 5,
						pricePerUnit: bike.purchasePrice,
						totalAmount: 5 * bike.purchasePrice,
					},
				],
				invoiceType: "purchase",
				paymentStatus: "paid",
				totalAmount: 5 * bike.purchasePrice,
				balanceAmount: 0,
				notes: "Initial stock purchase",
			});
			await purchaseInvoice.save();

			(creditor.transactions as mongoose.Types.ObjectId[]).push(purchaseInvoice._id as mongoose.Types.ObjectId);
			creditor.balanceAmount += purchaseInvoice.totalAmount;
			await creditor.save();
		}

		if (debtor && sparePart) {
			// Sale invoice
			const saleInvoice = new Invoice({
				invoiceNumber: "INV-20241018-002",
				date: new Date(),
				partyId: debtor._id,
				items: [
					{
						itemId: sparePart._id,
						quantity: 2,
						pricePerUnit: sparePart.sellingPrice,
						totalAmount: 2 * sparePart.sellingPrice,
					},
				],
				invoiceType: "sale",
				paymentStatus: "pending",
				totalAmount: 2 * sparePart.sellingPrice,
				balanceAmount: 2 * sparePart.sellingPrice,
				notes: "Customer purchase",
			});
			await saleInvoice.save();

			(debtor.transactions as mongoose.Types.ObjectId[]).push(saleInvoice._id as mongoose.Types.ObjectId);
			debtor.balanceAmount += saleInvoice.totalAmount;
			await debtor.save();
		}

		console.log("Database seeded successfully!");
		console.log(`Created ${parties.length} parties`);
		console.log(`Created ${inventory.length} inventory items`);
		console.log("Created sample invoices and stock history");

		process.exit(0);
	} catch (error) {
		console.error("Error seeding database:", error);
		process.exit(1);
	}
}

seedDatabase();
