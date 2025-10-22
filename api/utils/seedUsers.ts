import { config } from "dotenv";
import { connectDB } from "../config/database.js";
import User from "../models/User.js";

config();

const users = [
	{
		username: "admin",
		email: "admin@vishalcycles.com",
		password: "admin123",
		role: "admin" as const,
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
		status: "active" as const,
	},
	{
		username: "manager",
		email: "manager@vishalcycles.com",
		password: "manager123",
		role: "manager" as const,
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=manager",
		status: "active" as const,
	},
	{
		username: "sales",
		email: "sales@vishalcycles.com",
		password: "sales123",
		role: "sales" as const,
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sales",
		status: "active" as const,
	},
];

const seedUsers = async () => {
	try {
		await connectDB();
		console.log("\n🌱 Seeding users...\n");

		// Clear existing users
		await User.deleteMany({});
		console.log("✓ Cleared existing users");

		// Create new users
		for (const userData of users) {
			const user = await User.create(userData);
			console.log(`✓ Created ${user.role} user: ${user.username} (${user.email})`);
		}

		console.log("\n✅ User seeding completed successfully!\n");
		console.log("Login Credentials:");
		console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
		console.log("Admin User:");
		console.log("  Username: admin");
		console.log("  Password: admin123");
		console.log("  Email:    admin@vishalcycles.com");
		console.log("");
		console.log("Manager User:");
		console.log("  Username: manager");
		console.log("  Password: manager123");
		console.log("  Email:    manager@vishalcycles.com");
		console.log("");
		console.log("Sales User:");
		console.log("  Username: sales");
		console.log("  Password: sales123");
		console.log("  Email:    sales@vishalcycles.com");
		console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

		process.exit(0);
	} catch (error) {
		console.error("❌ Error seeding users:", error);
		process.exit(1);
	}
};

seedUsers();
