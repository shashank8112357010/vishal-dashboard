import express from "express";
import { customerController } from "../controllers/customerController.js";

const router = express.Router();

router.get("/", customerController.getAll);
router.get("/search", customerController.search);
router.get("/:id", customerController.getById);
router.get("/:id/profile", customerController.getProfile);
router.post("/", customerController.create);
router.put("/:id", customerController.update);
router.delete("/:id", customerController.delete);

export default router;
