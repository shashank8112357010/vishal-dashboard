import mongoose from "mongoose";
import { config } from "dotenv";
import { connectDB } from "../config/database.js";
import Employee from "../models/Employee.js";
import Customer from "../models/Customer.js";
import { Inventory } from "../models/Inventory.js";
import { Party } from "../models/Party.js";
import { Invoice } from "../models/Invoice.js";

config();

// Employee seed data
const employees = [
	{
		employeeId: "EMP001",
		name: "Rajesh Kumar",
		email: "rajesh.kumar@vishalcycles.com",
		phoneNumber: "9876543210",
		address: "123 MG Road, Bangalore, Karnataka",
		dateOfJoining: new Date("2022-01-15"),
		position: "Sales Executive",
		department: "Sales",
		salary: 25000,
		status: "active",
	},
	{
		employeeId: "EMP002",
		name: "Priya Sharma",
		email: "priya.sharma@vishalcycles.com",
		phoneNumber: "9876543211",
		address: "456 Brigade Road, Bangalore, Karnataka",
		dateOfJoining: new Date("2022-03-20"),
		position: "Sales Executive",
		department: "Sales",
		salary: 25000,
		status: "active",
	},
	{
		employeeId: "EMP003",
		name: "Amit Patel",
		email: "amit.patel@vishalcycles.com",
		phoneNumber: "9876543212",
		address: "789 Whitefield, Bangalore, Karnataka",
		dateOfJoining: new Date("2021-11-10"),
		position: "Senior Sales Executive",
		department: "Sales",
		salary: 30000,
		status: "active",
	},
	{
		employeeId: "EMP004",
		name: "Sunita Reddy",
		email: "sunita.reddy@vishalcycles.com",
		phoneNumber: "9876543213",
		address: "321 Koramangala, Bangalore, Karnataka",
		dateOfJoining: new Date("2023-01-05"),
		position: "Sales Manager",
		department: "Sales",
		salary: 45000,
		status: "active",
	},
];

// Customer seed data
const customers = [
	{
		customerName: "Vikram Singh",
		phone: "9988776655",
		email: "vikram.singh@gmail.com",
		address: "12 Jayanagar 4th Block, Bangalore",
		birthday: new Date("1985-06-15"),
		children: ["Arjun Singh", "Ananya Singh"],
		newsletter: true,
		notes: "Prefers mountain bikes, regular customer",
	},
	{
		customerName: "Lakshmi Menon",
		phone: "9988776656",
		email: "lakshmi.menon@gmail.com",
		address: "45 Indiranagar, Bangalore",
		birthday: new Date("1990-03-22"),
		children: ["Ravi Menon"],
		newsletter: true,
		notes: "Interested in children's bicycles",
	},
	{
		customerName: "Arjun Nair",
		phone: "9988776657",
		email: "arjun.nair@yahoo.com",
		address: "78 HSR Layout, Bangalore",
		birthday: new Date("1988-11-30"),
		children: [],
		newsletter: false,
		notes: "Looking for spare parts",
	},
	{
		customerName: "Sneha Desai",
		phone: "9988776658",
		email: "sneha.desai@hotmail.com",
		address: "23 Malleshwaram, Bangalore",
		birthday: new Date("1995-08-10"),
		children: ["Aarav Desai"],
		newsletter: true,
		notes: "First-time buyer, needs guidance",
	},
	{
		customerName: "Ramesh Iyer",
		phone: "9988776659",
		email: "ramesh.iyer@gmail.com",
		address: "67 BTM Layout, Bangalore",
		birthday: new Date("1982-02-18"),
		children: ["Divya Iyer", "Karthik Iyer"],
		newsletter: true,
		notes: "VIP customer, premium segment",
	},
	{
		customerName: "Anjali Chopra",
		phone: "9988776660",
		email: "anjali.chopra@gmail.com",
		address: "90 Basavanagudi, Bangalore",
		birthday: new Date("1992-12-05"),
		children: [],
		newsletter: false,
		notes: "Fitness enthusiast, interested in road bikes",
	},
	{
		customerName: "Karan Malhotra",
		phone: "9988776661",
		email: "karan.malhotra@outlook.com",
		address: "34 Yelahanka, Bangalore",
		birthday: new Date("1987-04-25"),
		children: ["Ishaan Malhotra"],
		newsletter: true,
		notes: "Regular maintenance customer",
	},
	{
		customerName: "Pooja Agarwal",
		phone: "9988776662",
		address: "56 JP Nagar, Bangalore",
		birthday: new Date("1993-09-14"),
		children: [],
		newsletter: false,
		notes: "Student discount applied",
	},
	{
		customerName: "Suresh Gupta",
		phone: "9988776663",
		email: "suresh.gupta@gmail.com",
		address: "89 Banashankari, Bangalore",
		birthday: new Date("1980-07-08"),
		children: ["Rohit Gupta", "Meera Gupta", "Sahil Gupta"],
		newsletter: true,
		notes: "Bulk buyer for family",
	},
	{
		customerName: "Divya Krishnan",
		phone: "9988776664",
		email: "divya.krishnan@yahoo.com",
		address: "12 Electronic City, Bangalore",
		birthday: new Date("1991-01-20"),
		children: ["Aisha Krishnan"],
		newsletter: true,
		notes: "Corporate employee, weekday buyer",
	},
];

// Party seed data (Creditors - Suppliers)
const parties = [
	{
		partyName: "Hero Cycles Pvt Ltd",
		partyType: "creditor",
		phoneNumber: "9123456780",
		state: "Punjab",
		city: "Ludhiana",
		gstNumber: "03AABCH1234F1Z5",
		address: "Industrial Area, Ludhiana, Punjab",
		balanceAmount: 150000,
	},
	{
		partyName: "Atlas Cycles Haryana Ltd",
		partyType: "creditor",
		phoneNumber: "9123456781",
		state: "Haryana",
		city: "Sonipat",
		gstNumber: "06AABCA5678G1Z2",
		address: "Atlas Road, Sonipat, Haryana",
		balanceAmount: 200000,
	},
	{
		partyName: "BSA Cycles & Accessories",
		partyType: "creditor",
		phoneNumber: "9123456782",
		state: "Tamil Nadu",
		city: "Chennai",
		gstNumber: "33AABCB9012H1Z9",
		address: "Guindy Industrial Estate, Chennai",
		balanceAmount: 75000,
	},
	{
		partyName: "Decathlon Sports India",
		partyType: "debtor",
		phoneNumber: "9123456783",
		state: "Karnataka",
		city: "Bangalore",
		gstNumber: "29AABCD1234I1Z1",
		address: "Whitefield, Bangalore",
		balanceAmount: -50000,
	},
];

// Inventory seed data
const inventoryItems = [
	{
		itemName: "Hero Sprint Pro 29T Mountain Bike",
		category: "bicycle",
		unitType: "piece",
		bundleCount: 1,
		quantityAvailable: 15,
		stockType: "fitted",
		purchasePrice: 12000,
		sellingPrice: 15000,
	},
	{
		itemName: "Atlas Tornado 26T City Bike",
		category: "bicycle",
		unitType: "piece",
		bundleCount: 1,
		quantityAvailable: 20,
		stockType: "fitted",
		purchasePrice: 8000,
		sellingPrice: 10000,
	},
	{
		itemName: "BSA Ladybird 24T Kids Bike",
		category: "bicycle",
		unitType: "piece",
		bundleCount: 1,
		quantityAvailable: 25,
		stockType: "fitted",
		purchasePrice: 5000,
		sellingPrice: 6500,
	},
	{
		itemName: "Hero Lectro C5 Electric Bike",
		category: "bicycle",
		unitType: "piece",
		bundleCount: 1,
		quantityAvailable: 8,
		stockType: "fitted",
		purchasePrice: 25000,
		sellingPrice: 32000,
	},
	{
		itemName: "Kenda Tire 26x2.1 MTB",
		category: "spare_part",
		unitType: "piece",
		bundleCount: 1,
		quantityAvailable: 50,
		stockType: "loose",
		purchasePrice: 400,
		sellingPrice: 600,
	},
	{
		itemName: "Shimano 21-Speed Gear Set",
		category: "spare_part",
		unitType: "set",
		bundleCount: 1,
		quantityAvailable: 30,
		stockType: "loose",
		purchasePrice: 1500,
		sellingPrice: 2200,
	},
	{
		itemName: "MTB Brake Pad Set",
		category: "spare_part",
		unitType: "pair",
		bundleCount: 1,
		quantityAvailable: 40,
		stockType: "loose",
		purchasePrice: 200,
		sellingPrice: 350,
	},
	{
		itemName: "LED Bike Light Set",
		category: "spare_part",
		unitType: "set",
		bundleCount: 1,
		quantityAvailable: 60,
		stockType: "loose",
		purchasePrice: 300,
		sellingPrice: 500,
	},
	{
		itemName: "Bike Chain KMC Z51",
		category: "spare_part",
		unitType: "piece",
		bundleCount: 1,
		quantityAvailable: 35,
		stockType: "loose",
		purchasePrice: 250,
		sellingPrice: 400,
	},
	{
		itemName: "Bell Sports Bike Helmet",
		category: "spare_part",
		unitType: "piece",
		bundleCount: 1,
		quantityAvailable: 45,
		stockType: "loose",
		purchasePrice: 800,
		sellingPrice: 1200,
	},
];

async function seedDatabase() {
	try {
		await connectDB();
		console.log("Connected to database");

		// Clear existing data
		console.log("Clearing existing data...");
		await Employee.deleteMany({});
		await Customer.deleteMany({});
		await Inventory.deleteMany({});
		await Party.deleteMany({});
		await Invoice.deleteMany({});
		console.log("Existing data cleared");

		// Insert Employees
		console.log("Inserting employees...");
		const insertedEmployees = await Employee.insertMany(employees);
		console.log(`Inserted ${insertedEmployees.length} employees`);

		// Insert Customers
		console.log("Inserting customers...");
		const insertedCustomers = await Customer.insertMany(customers);
		console.log(`Inserted ${insertedCustomers.length} customers`);

		// Insert Parties
		console.log("Inserting parties...");
		const insertedParties = await Party.insertMany(parties);
		console.log(`Inserted ${insertedParties.length} parties`);

		// Insert Inventory Items
		console.log("Inserting inventory items...");
		const insertedInventory = await Inventory.insertMany(inventoryItems);
		console.log(`Inserted ${insertedInventory.length} inventory items`);

		// Create Sales Invoices
		console.log("Creating sales invoices...");
		const salesInvoices = [];

		// Invoice 1: Vikram Singh - Mountain Bike + Accessories
		salesInvoices.push({
			invoiceNumber: "INV-2024-001",
			date: new Date("2024-01-15"),
			partyId: insertedParties[3]._id, // Decathlon (Debtor)
			customerId: insertedCustomers[0]._id, // Vikram Singh
			items: [
				{
					itemId: insertedInventory[0]._id, // Hero Sprint Pro
					quantity: 1,
					pricePerUnit: 15000,
					totalAmount: 15000,
				},
				{
					itemId: insertedInventory[7]._id, // LED Light Set
					quantity: 1,
					pricePerUnit: 500,
					totalAmount: 500,
				},
				{
					itemId: insertedInventory[9]._id, // Helmet
					quantity: 1,
					pricePerUnit: 1200,
					totalAmount: 1200,
				},
			],
			invoiceType: "sale",
			paymentStatus: "paid",
			totalAmount: 16700,
			balanceAmount: 0,
			notes: "First purchase - mountain bike with safety accessories",
		});

		// Invoice 2: Lakshmi Menon - Kids Bikes
		salesInvoices.push({
			invoiceNumber: "INV-2024-002",
			date: new Date("2024-01-18"),
			partyId: insertedParties[3]._id,
			customerId: insertedCustomers[1]._id, // Lakshmi Menon
			items: [
				{
					itemId: insertedInventory[2]._id, // BSA Kids Bike
					quantity: 2,
					pricePerUnit: 6500,
					totalAmount: 13000,
				},
				{
					itemId: insertedInventory[9]._id, // Helmet
					quantity: 2,
					pricePerUnit: 1200,
					totalAmount: 2400,
				},
			],
			invoiceType: "sale",
			paymentStatus: "partial",
			totalAmount: 15400,
			balanceAmount: 5400,
			notes: "Two kids bikes for children",
		});

		// Invoice 3: Ramesh Iyer - Premium Electric Bike
		salesInvoices.push({
			invoiceNumber: "INV-2024-003",
			date: new Date("2024-01-22"),
			partyId: insertedParties[3]._id,
			customerId: insertedCustomers[4]._id, // Ramesh Iyer
			items: [
				{
					itemId: insertedInventory[3]._id, // Electric Bike
					quantity: 1,
					pricePerUnit: 32000,
					totalAmount: 32000,
				},
				{
					itemId: insertedInventory[7]._id, // LED Light
					quantity: 1,
					pricePerUnit: 500,
					totalAmount: 500,
				},
			],
			invoiceType: "sale",
			paymentStatus: "paid",
			totalAmount: 32500,
			balanceAmount: 0,
			notes: "VIP customer - premium electric bike",
		});

		// Invoice 4: Suresh Gupta - Bulk Family Purchase
		salesInvoices.push({
			invoiceNumber: "INV-2024-004",
			date: new Date("2024-02-01"),
			partyId: insertedParties[3]._id,
			customerId: insertedCustomers[8]._id, // Suresh Gupta
			items: [
				{
					itemId: insertedInventory[1]._id, // City Bike
					quantity: 2,
					pricePerUnit: 10000,
					totalAmount: 20000,
				},
				{
					itemId: insertedInventory[2]._id, // Kids Bike
					quantity: 2,
					pricePerUnit: 6500,
					totalAmount: 13000,
				},
				{
					itemId: insertedInventory[9]._id, // Helmet
					quantity: 4,
					pricePerUnit: 1200,
					totalAmount: 4800,
				},
			],
			invoiceType: "sale",
			paymentStatus: "partial",
			totalAmount: 37800,
			balanceAmount: 15000,
			notes: "Family bulk purchase - 4 bikes total",
		});

		// Invoice 5: Anjali Chopra - Road Bike + Gear
		salesInvoices.push({
			invoiceNumber: "INV-2024-005",
			date: new Date("2024-02-10"),
			partyId: insertedParties[3]._id,
			customerId: insertedCustomers[5]._id, // Anjali Chopra
			items: [
				{
					itemId: insertedInventory[0]._id, // Mountain Bike
					quantity: 1,
					pricePerUnit: 15000,
					totalAmount: 15000,
				},
				{
					itemId: insertedInventory[5]._id, // Shimano Gear
					quantity: 1,
					pricePerUnit: 2200,
					totalAmount: 2200,
				},
				{
					itemId: insertedInventory[9]._id, // Helmet
					quantity: 1,
					pricePerUnit: 1200,
					totalAmount: 1200,
				},
			],
			invoiceType: "sale",
			paymentStatus: "paid",
			totalAmount: 18400,
			balanceAmount: 0,
			notes: "Fitness enthusiast - performance bike",
		});

		// Invoice 6: Vikram Singh - Second Purchase (Spare Parts)
		salesInvoices.push({
			invoiceNumber: "INV-2024-006",
			date: new Date("2024-02-20"),
			partyId: insertedParties[3]._id,
			customerId: insertedCustomers[0]._id, // Vikram Singh (returning customer)
			items: [
				{
					itemId: insertedInventory[4]._id, // Tire
					quantity: 2,
					pricePerUnit: 600,
					totalAmount: 1200,
				},
				{
					itemId: insertedInventory[6]._id, // Brake Pads
					quantity: 2,
					pricePerUnit: 350,
					totalAmount: 700,
				},
				{
					itemId: insertedInventory[8]._id, // Chain
					quantity: 1,
					pricePerUnit: 400,
					totalAmount: 400,
				},
			],
			invoiceType: "sale",
			paymentStatus: "paid",
			totalAmount: 2300,
			balanceAmount: 0,
			notes: "Maintenance parts for mountain bike",
		});

		// Invoice 7: Divya Krishnan - City Bike
		salesInvoices.push({
			invoiceNumber: "INV-2024-007",
			date: new Date("2024-03-01"),
			partyId: insertedParties[3]._id,
			customerId: insertedCustomers[9]._id, // Divya Krishnan
			items: [
				{
					itemId: insertedInventory[1]._id, // City Bike
					quantity: 1,
					pricePerUnit: 10000,
					totalAmount: 10000,
				},
				{
					itemId: insertedInventory[7]._id, // LED Light
					quantity: 1,
					pricePerUnit: 500,
					totalAmount: 500,
				},
			],
			invoiceType: "sale",
			paymentStatus: "paid",
			totalAmount: 10500,
			balanceAmount: 0,
			notes: "Commuter bike for office",
		});

		// Invoice 8: Ramesh Iyer - Second Purchase (Another bike for family)
		salesInvoices.push({
			invoiceNumber: "INV-2024-008",
			date: new Date("2024-03-10"),
			partyId: insertedParties[3]._id,
			customerId: insertedCustomers[4]._id, // Ramesh Iyer (VIP returning)
			items: [
				{
					itemId: insertedInventory[1]._id, // City Bike
					quantity: 1,
					pricePerUnit: 10000,
					totalAmount: 10000,
				},
				{
					itemId: insertedInventory[2]._id, // Kids Bike
					quantity: 1,
					pricePerUnit: 6500,
					totalAmount: 6500,
				},
			],
			invoiceType: "sale",
			paymentStatus: "paid",
			totalAmount: 16500,
			balanceAmount: 0,
			notes: "VIP customer - additional bikes for family members",
		});

		const insertedInvoices = await Invoice.insertMany(salesInvoices);
		console.log(`Inserted ${insertedInvoices.length} sales invoices`);

		console.log("\n✅ Database seeding completed successfully!");
		console.log("\nSummary:");
		console.log(`- Employees: ${insertedEmployees.length}`);
		console.log(`- Customers: ${insertedCustomers.length}`);
		console.log(`- Parties: ${insertedParties.length}`);
		console.log(`- Inventory Items: ${insertedInventory.length}`);
		console.log(`- Sales Invoices: ${insertedInvoices.length}`);

		process.exit(0);
	} catch (error) {
		console.error("Error seeding database:", error);
		process.exit(1);
	}
}

seedDatabase();
