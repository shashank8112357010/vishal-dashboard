import cors from "cors";
import express from "express";
import "express-async-errors";
import { config } from "dotenv";
import { connectDB } from "./config/database.js";
import routes from "./routes/index.js";

config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", routes);

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
