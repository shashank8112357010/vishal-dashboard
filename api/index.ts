import cors from "cors";
import express from "express";
import "express-async-errors";
import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectDB } from "./config/database.js";
import routes from "./routes/index.js";

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api", routes);

// Serve static files from the React app in production
if (process.env.NODE_ENV === "production") {
	// Serve static files from the client folder
	app.use(express.static(path.join(__dirname, "client")));

	// Handle React routing, return all requests to React app
	app.get("*", (_req, res) => {
		res.sendFile(path.join(__dirname, "client/index.html"));
	});
}

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
	console.error(err.stack);
	res.status(500).json({ error: err.message || "Something went wrong!" });
});

// Start server
const start = async () => {
	try {
		await connectDB();
		app.listen(PORT, "0.0.0.0", () => {
			console.log(`Server running on http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
};

start();
