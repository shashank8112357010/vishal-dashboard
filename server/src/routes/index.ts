import { Router } from "express";
import { inventoryController } from "../controllers/inventoryController.js";
import { invoiceController } from "../controllers/invoiceController.js";
import { partyController } from "../controllers/partyController.js";

const router = Router();

// Party routes
router.get("/parties", partyController.getAll);
router.get("/parties/:id", partyController.getById);
router.post("/parties", partyController.create);
router.put("/parties/:id", partyController.update);
router.delete("/parties/:id", partyController.delete);

// Inventory routes
router.get("/inventory", inventoryController.getAll);
router.get("/inventory/:id", inventoryController.getById);
router.post("/inventory", inventoryController.create);
router.put("/inventory/:id", inventoryController.update);
router.delete("/inventory/:id", inventoryController.delete);
router.post("/inventory/adjust", inventoryController.adjustStock);

// Invoice routes
router.get("/invoices", invoiceController.getAll);
router.get("/invoices/:id", invoiceController.getById);
router.post("/invoices", invoiceController.create);
router.put("/invoices/:id", invoiceController.update);
router.delete("/invoices/:id", invoiceController.delete);

export default router;
