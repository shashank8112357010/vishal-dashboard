import type { Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest } from "../middleware/auth.js";
import User from "../models/User.js";

// Generate JWT Token
const generateToken = (id: string): string => {
	const secret = process.env.JWT_SECRET || "fallback-secret";
	return jwt.sign({ id }, secret, { expiresIn: "7d" });
};

// Generate Refresh Token
const generateRefreshToken = (id: string): string => {
	const secret = process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret";
	return jwt.sign({ id }, secret, { expiresIn: "30d" });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req: AuthRequest, res: Response) => {
	try {
		const { username, email, password, role } = req.body;

		// Validation
		if (!username || !email || !password) {
			return res.status(400).json({
				status: 400,
				message: "Please provide username, email, and password",
			});
		}

		// Check if user already exists
		const userExists = await User.findOne({
			$or: [{ email }, { username }],
		});

		if (userExists) {
			return res.status(400).json({
				status: 400,
				message: userExists.email === email ? "Email already registered" : "Username already taken",
			});
		}

		// Create user
		const user = await User.create({
			username,
			email,
			password,
			role: role || "sales", // Default to sales role
		});

		// Generate tokens
		const accessToken = generateToken(String(user._id));
		const refreshToken = generateRefreshToken(String(user._id));

		// Prepare user response (password is excluded by toJSON transform)
		const userResponse = user.toJSON();

		res.status(201).json({
			status: 0,
			message: "User registered successfully",
			data: {
				user: userResponse,
				accessToken,
				refreshToken,
			},
		});
	} catch (error: any) {
		console.error("Signup error:", error);

		// Handle validation errors
		if (error.name === "ValidationError") {
			const messages = Object.values(error.errors).map((err: any) => err.message);
			return res.status(400).json({
				status: 400,
				message: messages.join(", "),
			});
		}

		res.status(500).json({
			status: 500,
			message: "Error creating user",
		});
	}
};

// @desc    Login user
// @route   POST /api/auth/signin
// @access  Public
export const signin = async (req: AuthRequest, res: Response) => {
	try {
		const { username, password } = req.body;

		// Validation
		if (!username || !password) {
			return res.status(400).json({
				status: 10001,
				message: "Please provide username and password",
			});
		}

		// Find user (explicitly select password field)
		const user = await User.findOne({ username }).select("+password");

		if (!user) {
			return res.status(401).json({
				status: 10001,
				message: "Incorrect username or password",
			});
		}

		// Check if user is active
		if (user.status !== "active") {
			return res.status(401).json({
				status: 10002,
				message: "Account is inactive. Please contact administrator",
			});
		}

		// Check password
		const isPasswordMatch = await user.comparePassword(password);

		if (!isPasswordMatch) {
			return res.status(401).json({
				status: 10001,
				message: "Incorrect username or password",
			});
		}

		// Generate tokens
		const accessToken = generateToken(String(user._id));
		const refreshToken = generateRefreshToken(String(user._id));

		// Prepare user response (remove password)
		const userResponse = {
			id: user._id,
			username: user.username,
			email: user.email,
			role: user.role,
			avatar: user.avatar,
			status: user.status,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};

		res.status(200).json({
			status: 0,
			message: "Login successful",
			data: {
				user: userResponse,
				accessToken,
				refreshToken,
			},
		});
	} catch (error) {
		console.error("Signin error:", error);
		res.status(500).json({
			status: 500,
			message: "Error logging in",
		});
	}
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refresh = async (req: AuthRequest, res: Response) => {
	try {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			return res.status(400).json({
				status: 400,
				message: "Refresh token is required",
			});
		}

		try {
			// Verify refresh token
			const secret = process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret";
			const decoded = jwt.verify(refreshToken, secret) as {
				id: string;
			};

			// Get user
			const user = await User.findById(decoded.id);

			if (!user) {
				return res.status(401).json({
					status: 401,
					message: "User not found",
				});
			}

			if (user.status !== "active") {
				return res.status(401).json({
					status: 401,
					message: "Account is inactive",
				});
			}

			// Generate new access token
			const newAccessToken = generateToken(String(user._id));

			res.status(200).json({
				status: 0,
				message: "Token refreshed successfully",
				data: {
					accessToken: newAccessToken,
				},
			});
		} catch (_error) {
			return res.status(401).json({
				status: 401,
				message: "Invalid or expired refresh token",
			});
		}
	} catch (error) {
		console.error("Refresh token error:", error);
		res.status(500).json({
			status: 500,
			message: "Error refreshing token",
		});
	}
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (_req: AuthRequest, res: Response) => {
	// In a JWT-based system, logout is typically handled client-side by removing the token
	// For additional security, you could maintain a token blacklist in Redis/DB
	res.status(200).json({
		status: 0,
		message: "Logout successful",
	});
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({
				status: 401,
				message: "Not authenticated",
			});
		}

		const user = await User.findById(req.user.id);

		if (!user) {
			return res.status(404).json({
				status: 404,
				message: "User not found",
			});
		}

		res.status(200).json({
			status: 0,
			message: "User retrieved successfully",
			data: user.toJSON(),
		});
	} catch (error) {
		console.error("Get me error:", error);
		res.status(500).json({
			status: 500,
			message: "Error fetching user",
		});
	}
};
