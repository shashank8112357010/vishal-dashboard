import { config } from "dotenv";
import { connectDB } from "../config/database.js";
import { Inventory } from "../models/Inventory.js";
import { Party } from "../models/Party.js";

config();

// Sample parties data
const partiesData = [
	{
		partyName: "Mumbai Bicycle Supplies",
		partyType: "creditor" as const,
		phoneNumber: "9876543210",
		state: "Maharashtra",
		city: "Mumbai",
		gstNumber: "27ABCDE1234F1Z5",
		address: "Shop 12, Market Road, Andheri East, Mumbai - 400069",
		balanceAmount: 0,
	},
	{
		partyName: "Pune Wheels Distributor",
		partyType: "creditor" as const,
		phoneNumber: "9876543211",
		state: "Maharashtra",
		city: "Pune",
		gstNumber: "27ABCDE5678G2Z5",
		address: "Unit 5, Industrial Area, Pune - 411001",
		balanceAmount: 0,
	},
	{
		partyName: "Rajesh Kumar",
		partyType: "debtor" as const,
		phoneNumber: "9123456780",
		state: "Maharashtra",
		city: "Mumbai",
		gstNumber: "",
		address: "Flat 201, Green View Apartments, Borivali West",
		balanceAmount: 0,
	},
	{
		partyName: "Priya Electronics",
		partyType: "debtor" as const,
		phoneNumber: "9123456781",
		state: "Maharashtra",
		city: "Thane",
		gstNumber: "27ABCDE9012H3Z5",
		address: "Shop 45, Thane Market, Thane - 400601",
		balanceAmount: 0,
	},
	{
		partyName: "Amit Retail Store",
		partyType: "debtor" as const,
		phoneNumber: "9123456782",
		state: "Maharashtra",
		city: "Navi Mumbai",
		gstNumber: "27ABCDE3456I4Z5",
		address: "Sector 10, Vashi, Navi Mumbai - 400703",
		balanceAmount: 0,
	},
];

// Sample inventory data
const inventoryData = [
	// Bicycles
	{
		itemName: "Hero Sprint 26T",
		category: "bicycle" as const,
		unitType: "piece" as const,
		bundleCount: 1,
		quantityAvailable: 15,
		stockType: "loose" as const,
		purchasePrice: 8500,
		sellingPrice: 10500,
	},
	{
		itemName: "Firefox Road Runner",
		category: "bicycle" as const,
		unitType: "piece" as const,
		bundleCount: 1,
		quantityAvailable: 10,
		stockType: "loose" as const,
		purchasePrice: 12000,
		sellingPrice: 15000,
	},
	{
		itemName: "Atlas Roadeo Pro",
		category: "bicycle" as const,
		unitType: "piece" as const,
		bundleCount: 1,
		quantityAvailable: 8,
		stockType: "loose" as const,
		purchasePrice: 9500,
		sellingPrice: 12000,
	},
	{
		itemName: "BSA Ladybird 24T",
		category: "bicycle" as const,
		unitType: "piece" as const,
		bundleCount: 1,
		quantityAvailable: 12,
		stockType: "loose" as const,
		purchasePrice: 7000,
		sellingPrice: 9000,
	},
	{
		itemName: "Hercules MTB Turbodrive",
		category: "bicycle" as const,
		unitType: "piece" as const,
		bundleCount: 1,
		quantityAvailable: 6,
		stockType: "loose" as const,
		purchasePrice: 11000,
		sellingPrice: 14000,
	},
	// Spare Parts
	{
		itemName: "Bicycle Chain (Standard)",
		category: "spare_part" as const,
		unitType: "piece" as const,
		bundleCount: 1,
		quantityAvailable: 50,
		stockType: "loose" as const,
		purchasePrice: 180,
		sellingPrice: 250,
	},
	{
		itemName: "Brake Cable Set",
		category: "spare_part" as const,
		unitType: "set" as const,
		bundleCount: 1,
		quantityAvailable: 35,
		stockType: "loose" as const,
		purchasePrice: 120,
		sellingPrice: 200,
	},
	{
		itemName: "Gear Cable Set",
		category: "spare_part" as const,
		unitType: "set" as const,
		bundleCount: 1,
		quantityAvailable: 30,
		stockType: "loose" as const,
		purchasePrice: 150,
		sellingPrice: 250,
	},
	{
		itemName: "Bicycle Tube 26T",
		category: "spare_part" as const,
		unitType: "piece" as const,
		bundleCount: 1,
		quantityAvailable: 80,
		stockType: "loose" as const,
		purchasePrice: 80,
		sellingPrice: 120,
	},
	{
		itemName: "Bicycle Tyre 26T",
		category: "spare_part" as const,
		unitType: "piece" as const,
		bundleCount: 1,
		quantityAvailable: 40,
		stockType: "loose" as const,
		purchasePrice: 350,
		sellingPrice: 500,
	},
	{
		itemName: "Pedal Set (Standard)",
		category: "spare_part" as const,
		unitType: "pair" as const,
		bundleCount: 1,
		quantityAvailable: 25,
		stockType: "loose" as const,
		purchasePrice: 200,
		sellingPrice: 300,
	},
	{
		itemName: "Bell (Chrome)",
		category: "spare_part" as const,
		unitType: "piece" as const,
		bundleCount: 1,
		quantityAvailable: 60,
		stockType: "loose" as const,
		purchasePrice: 40,
		sellingPrice: 70,
	},
	{
		itemName: "Mudguard Set",
		category: "spare_part" as const,
		unitType: "set" as const,
		bundleCount: 1,
		quantityAvailable: 20,
		stockType: "loose" as const,
		purchasePrice: 250,
		sellingPrice: 400,
	},
	{
		itemName: "Seat/Saddle (Comfort)",
		category: "spare_part" as const,
		unitType: "piece" as const,
		bundleCount: 1,
		quantityAvailable: 18,
		stockType: "loose" as const,
		purchasePrice: 300,
		sellingPrice: 450,
	},
	{
		itemName: "Handle Grips (Rubber)",
		category: "spare_part" as const,
		unitType: "pair" as const,
		bundleCount: 1,
		quantityAvailable: 45,
		stockType: "loose" as const,
		purchasePrice: 50,
		sellingPrice: 90,
	},
	{
		itemName: "Spoke Set (26T)",
		category: "spare_part" as const,
		unitType: "set" as const,
		bundleCount: 1,
		quantityAvailable: 15,
		stockType: "loose" as const,
		purchasePrice: 180,
		sellingPrice: 280,
	},
	{
		itemName: "Reflector Set",
		category: "spare_part" as const,
		unitType: "set" as const,
		bundleCount: 1,
		quantityAvailable: 40,
		stockType: "loose" as const,
		purchasePrice: 80,
		sellingPrice: 130,
	},
	{
		itemName: "Carrier/Stand",
		category: "spare_part" as const,
		unitType: "piece" as const,
		bundleCount: 1,
		quantityAvailable: 12,
		stockType: "loose" as const,
		purchasePrice: 400,
		sellingPrice: 600,
	},
	{
		itemName: "Lock (Cable Type)",
		category: "spare_part" as const,
		unitType: "piece" as const,
		bundleCount: 1,
		quantityAvailable: 30,
		stockType: "loose" as const,
		purchasePrice: 150,
		sellingPrice: 250,
	},
	{
		itemName: "Pump (Floor)",
		category: "spare_part" as const,
		unitType: "piece" as const,
		bundleCount: 1,
		quantityAvailable: 22,
		stockType: "loose" as const,
		purchasePrice: 200,
		sellingPrice: 320,
	},
];

const seedAll = async () => {
	try {
		await connectDB();
		console.log("\n🌱 Seeding database with sample data...\n");

		// Clear existing data
		console.log("🗑️  Clearing existing data...");
		await Party.deleteMany({});
		console.log("✓ Cleared parties");
		await Inventory.deleteMany({});
		console.log("✓ Cleared inventory");

		// Seed Parties
		console.log("\n📦 Seeding parties...");
		const parties = await Party.insertMany(partiesData);
		console.log(`✓ Created ${parties.length} parties`);
		for (const party of parties) {
			console.log(`  - ${party.partyName} (${party.partyType})`);
		}

		// Seed Inventory
		console.log("\n📦 Seeding inventory...");
		const inventory = await Inventory.insertMany(inventoryData);
		console.log(`✓ Created ${inventory.length} inventory items`);
		const bicycleCount = inventory.filter((item) => item.category === "bicycle").length;
		const sparePartCount = inventory.filter((item) => item.category === "spare_part").length;
		console.log(`  - ${bicycleCount} bicycles`);
		console.log(`  - ${sparePartCount} spare parts`);

		// Calculate total stock value
		const totalStockValue = inventory.reduce((sum, item) => {
			return sum + item.quantityAvailable * item.purchasePrice;
		}, 0);

		console.log("\n✅ Seeding completed successfully!\n");
		console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
		console.log("📊 Summary:");
		console.log(
			`   Parties: ${parties.length} (${partiesData.filter((p) => p.partyType === "creditor").length} creditors, ${partiesData.filter((p) => p.partyType === "debtor").length} debtors)`,
		);
		console.log(`   Inventory Items: ${inventory.length}`);
		console.log(`   Total Stock Value: ₹${totalStockValue.toLocaleString("en-IN")}`);
		console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

		process.exit(0);
	} catch (error) {
		console.error("❌ Error seeding database:", error);
		process.exit(1);
	}
};

seedAll();
