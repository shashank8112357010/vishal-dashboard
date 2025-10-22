import type { Request, Response } from "express";
import Customer from "../models/Customer.js";
import { type IInvoice, Invoice } from "../models/Invoice.js";

export const customerController = {
	// Get all customers
	async getAll(_req: Request, res: Response) {
		try {
			const customers = await Customer.find().sort({ createdAt: -1 });
			res.json(customers);
		} catch (error) {
			res.status(500).json({ message: "Error fetching customers", error });
		}
	},

	// Get customer by ID
	async getById(req: Request, res: Response) {
		try {
			const customer = await Customer.findById(req.params.id);
			if (!customer) {
				return res.status(404).json({ message: "Customer not found" });
			}
			res.json(customer);
		} catch (error) {
			res.status(500).json({ message: "Error fetching customer", error });
		}
	},

	// Get customer profile with analytics
	async getProfile(req: Request, res: Response) {
		try {
			const customer = await Customer.findById(req.params.id);
			if (!customer) {
				return res.status(404).json({ message: "Customer not found" });
			}

			// Get all invoices for this customer
			const invoices = await Invoice.find({ customerId: req.params.id }).populate("items.itemId").sort({ date: -1 });

			// Calculate analytics
			const totalPurchaseAmount = invoices
				.filter((inv: IInvoice) => inv.invoiceType === "sale")
				.reduce((sum: number, inv: IInvoice) => sum + inv.totalAmount, 0);

			const totalInvoices = invoices.filter((inv: IInvoice) => inv.invoiceType === "sale").length;

			const lastPurchaseDate = invoices.length > 0 ? invoices[0].date : null;

			// Get products purchased with quantities
			const productMap = new Map<
				string,
				{ itemName: string; totalQuantity: number; totalAmount: number; category: string }
			>();

			invoices
				.filter((inv: IInvoice) => inv.invoiceType === "sale")
				.forEach((invoice: IInvoice) => {
					invoice.items.forEach((item: any) => {
						const itemId = typeof item.itemId === "string" ? item.itemId : item.itemId._id.toString();
						const itemName = typeof item.itemId === "string" ? "Unknown" : item.itemId.itemName;
						const category = typeof item.itemId === "string" ? "unknown" : item.itemId.category;

						if (productMap.has(itemId)) {
							const existing = productMap.get(itemId)!;
							existing.totalQuantity += item.quantity;
							existing.totalAmount += item.totalAmount;
						} else {
							productMap.set(itemId, {
								itemName,
								totalQuantity: item.quantity,
								totalAmount: item.totalAmount,
								category,
							});
						}
					});
				});

			const productsPurchased = Array.from(productMap.entries()).map(([itemId, data]) => ({
				itemId,
				...data,
			}));

			// Calculate loyalty status based on purchase amount
			let loyaltyStatus = "New";
			if (totalPurchaseAmount >= 100000) {
				loyaltyStatus = "Platinum";
			} else if (totalPurchaseAmount >= 50000) {
				loyaltyStatus = "Gold";
			} else if (totalPurchaseAmount >= 25000) {
				loyaltyStatus = "Silver";
			} else if (totalPurchaseAmount >= 10000) {
				loyaltyStatus = "Bronze";
			}

			const profile = {
				customer,
				analytics: {
					totalPurchaseAmount,
					totalInvoices,
					lastPurchaseDate,
					customerSince: customer.createdAt,
					loyaltyStatus,
					productsPurchased,
				},
				recentInvoices: invoices.slice(0, 10), // Last 10 invoices
			};

			res.json(profile);
		} catch (error) {
			res.status(500).json({ message: "Error fetching customer profile", error });
		}
	},

	// Create customer
	async create(req: Request, res: Response) {
		try {
			const customer = new Customer(req.body);
			const savedCustomer = await customer.save();
			res.status(201).json(savedCustomer);
		} catch (error) {
			res.status(400).json({ message: "Error creating customer", error });
		}
	},

	// Update customer
	async update(req: Request, res: Response) {
		try {
			const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
				new: true,
				runValidators: true,
			});
			if (!customer) {
				return res.status(404).json({ message: "Customer not found" });
			}
			res.json(customer);
		} catch (error) {
			res.status(400).json({ message: "Error updating customer", error });
		}
	},

	// Delete customer
	async delete(req: Request, res: Response) {
		try {
			const customer = await Customer.findByIdAndDelete(req.params.id);
			if (!customer) {
				return res.status(404).json({ message: "Customer not found" });
			}
			res.json({ message: "Customer deleted successfully" });
		} catch (error) {
			res.status(500).json({ message: "Error deleting customer", error });
		}
	},

	// Search customers
	async search(req: Request, res: Response) {
		try {
			const { query } = req.query;
			if (!query) {
				return res.json([]);
			}

			const customers = await Customer.find({
				$or: [
					{ customerName: { $regex: query, $options: "i" } },
					{ phone: { $regex: query, $options: "i" } },
					{ address: { $regex: query, $options: "i" } },
				],
			}).limit(20);

			res.json(customers);
		} catch (error) {
			res.status(500).json({ message: "Error searching customers", error });
		}
	},
};
