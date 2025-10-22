import { Router } from "express";
import { inventoryController } from "../controllers/inventoryController.js";
import { invoiceController } from "../controllers/invoiceController.js";
import { partyController } from "../controllers/partyController.js";
import { authorize, protect } from "../middleware/auth.js";
import authRoutes from "./auth.js";

const router = Router();

// Auth routes (public)
router.use("/auth", authRoutes);

// All routes below require authentication
router.use(protect);

// Party routes
// All roles can view parties
router.get("/parties", partyController.getAll);
router.get("/parties/:id", partyController.getById);
// Only manager and admin can create/update/delete parties
router.post("/parties", authorize("manager", "admin"), partyController.create);
router.put("/parties/:id", authorize("manager", "admin"), partyController.update);
router.delete("/parties/:id", authorize("manager", "admin"), partyController.delete);

// Inventory routes
// All roles can view inventory
router.get("/inventory", inventoryController.getAll);
router.get("/inventory/:id", inventoryController.getById);
// Only manager and admin can manage inventory
router.post("/inventory", authorize("manager", "admin"), inventoryController.create);
router.put("/inventory/:id", authorize("manager", "admin"), inventoryController.update);
router.delete("/inventory/:id", authorize("manager", "admin"), inventoryController.delete);
router.post("/inventory/adjust", authorize("manager", "admin"), inventoryController.adjustStock);

// Invoice routes
// All roles can view and create invoices
router.get("/invoices", invoiceController.getAll);
router.get("/invoices/:id", invoiceController.getById);
router.post("/invoices", invoiceController.create);
// Only manager and admin can update/delete invoices
router.put("/invoices/:id", authorize("manager", "admin"), invoiceController.update);
router.delete("/invoices/:id", authorize("manager", "admin"), invoiceController.delete);

export default router;
