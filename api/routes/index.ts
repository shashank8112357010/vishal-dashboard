import { Router } from "express";
import { attendanceController } from "../controllers/attendanceController.js";
import { customerController } from "../controllers/customerController.js";
import { employeeController } from "../controllers/employeeController.js";
import { inventoryController } from "../controllers/inventoryController.js";
import { invoiceController } from "../controllers/invoiceController.js";
import { partyController } from "../controllers/partyController.js";
import { payrollController } from "../controllers/payrollController.js";
import { rolePermissionController } from "../controllers/rolePermissionController.js";
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

// Employee routes
// All roles can view employees
router.get("/employees", employeeController.getAll);
router.get("/employees/:id", employeeController.getById);
// Only manager and admin can manage employees
router.post("/employees", authorize("manager", "admin"), employeeController.create);
router.put("/employees/:id", authorize("manager", "admin"), employeeController.update);
router.delete("/employees/:id", authorize("manager", "admin"), employeeController.delete);

// Customer routes
// All roles can view and search customers
router.get("/customers", customerController.getAll);
router.get("/customers/search", customerController.search);
router.get("/customers/:id", customerController.getById);
router.get("/customers/:id/profile", customerController.getProfile);
// Only manager and admin can manage customers
router.post("/customers", authorize("manager", "admin"), customerController.create);
router.put("/customers/:id", authorize("manager", "admin"), customerController.update);
router.delete("/customers/:id", authorize("manager", "admin"), customerController.delete);

// Attendance routes
// All roles can view attendance
router.get("/attendance", attendanceController.getAll);
router.get("/attendance/month-summary", attendanceController.getMonthSummary);
router.get("/attendance/:id", attendanceController.getById);
// Only manager and admin can manage attendance
router.post("/attendance", authorize("manager", "admin"), attendanceController.create);
router.put("/attendance/:id", authorize("manager", "admin"), attendanceController.update);
router.delete("/attendance/:id", authorize("manager", "admin"), attendanceController.delete);

// Payroll routes
// All roles can view payroll
router.get("/payroll", payrollController.getAll);
router.get("/payroll/:id", payrollController.getById);
// Only manager and admin can manage payroll
router.post("/payroll", authorize("manager", "admin"), payrollController.create);
router.put("/payroll/:id", authorize("manager", "admin"), payrollController.update);
router.delete("/payroll/:id", authorize("manager", "admin"), payrollController.delete);

// Role Permission routes
// Only admin can manage role permissions
router.get("/role-permissions", authorize("admin"), rolePermissionController.getAll);
router.get("/role-permissions/:role", authorize("admin"), rolePermissionController.getByRole);
router.post("/role-permissions", authorize("admin"), rolePermissionController.createOrUpdate);
router.delete("/role-permissions/:role", authorize("admin"), rolePermissionController.delete);

export default router;
