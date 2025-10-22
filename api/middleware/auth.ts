import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { type UserRole } from "../models/User.js";

export interface AuthRequest extends Request {
	user?: {
		id: string;
		username: string;
		email: string;
		role: UserRole;
	};
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
	try {
		let token: string | undefined;

		// Get token from header
		if (req.headers.authorization?.startsWith("Bearer")) {
			token = req.headers.authorization.split(" ")[1];
		}

		if (!token) {
			return res.status(401).json({
				status: 401,
				message: "Not authorized, no token provided",
			});
		}

		try {
			// Verify token
			const secret = process.env.JWT_SECRET || "fallback-secret";
			const decoded = jwt.verify(token, secret) as {
				id: string;
			};

			// Get user from token
			const user = await User.findById(decoded.id).select("-password");

			if (!user) {
				return res.status(401).json({
					status: 401,
					message: "User not found",
				});
			}

			if (user.status !== "active") {
				return res.status(401).json({
					status: 401,
					message: "User account is inactive",
				});
			}

			// Attach user to request
			req.user = {
				id: String(user._id),
				username: user.username,
				email: user.email,
				role: user.role,
			};

			next();
		} catch (_error) {
			return res.status(401).json({
				status: 401,
				message: "Not authorized, token invalid or expired",
			});
		}
	} catch (error) {
		console.error("Auth middleware error:", error);
		return res.status(500).json({
			status: 500,
			message: "Server error during authentication",
		});
	}
};

// Middleware to check if user has required role
export const authorize = (...roles: UserRole[]) => {
	return (req: AuthRequest, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({
				status: 401,
				message: "Not authenticated",
			});
		}

		if (!roles.includes(req.user.role)) {
			return res.status(403).json({
				status: 403,
				message: `Access denied. Required role: ${roles.join(" or ")}`,
			});
		}

		next();
	};
};
