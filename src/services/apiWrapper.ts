import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import { toast } from "sonner";
import { GLOBAL_CONFIG } from "@/global-config";
import userStore from "@/store/userStore";

// Create a separate axios instance for our bicycle shop backend
const bicycleShopAxios = axios.create({
	baseURL: GLOBAL_CONFIG.apiBaseUrl,
	timeout: 50000,
	headers: { "Content-Type": "application/json;charset=utf-8" },
});

// Add request interceptor to attach Authorization token
bicycleShopAxios.interceptors.request.use(
	(config) => {
		// Get token from userStore
		const { accessToken } = userStore.getState().userToken;
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

// Add response interceptor to handle 401 errors
bicycleShopAxios.interceptors.response.use(
	(response) => response,
	(error) => {
		const { response, config } = error || {};

		// Handle 401 Unauthorized - Clear user state and redirect to login
		// But skip this for auth endpoints (login, signup, refresh)
		const isAuthEndpoint =
			config?.url?.includes("/auth/signin") ||
			config?.url?.includes("/auth/signup") ||
			config?.url?.includes("/auth/refresh");

		if (response?.status === 401 && !isAuthEndpoint) {
			userStore.getState().actions.clearUserInfoAndToken();
			toast.error("Session expired. Please login again.", { position: "top-center" });

			// Redirect to login page
			if (!window.location.pathname.includes("/login")) {
				window.location.href = "/login";
			}
		}

		return Promise.reject(error);
	},
);

// Wrapper to bypass the Result<T> interceptor for our backend
class DirectAPIClient {
	async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
		try {
			const response = await bicycleShopAxios.get<T>(url, config);
			console.log("Direct API response for", url, ":", response.data);
			return response.data;
		} catch (error) {
			console.error("Error in directApiClient.get:", error);
			throw error;
		}
	}

	async post<T = unknown>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
		try {
			const response = await bicycleShopAxios.post<T>(url, data, config);
			console.log("Direct API POST response for", url, ":", response.data);
			return response.data;
		} catch (error) {
			console.error("Error in directApiClient.post:", error);
			throw error;
		}
	}

	async put<T = unknown>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
		try {
			const response = await bicycleShopAxios.put<T>(url, data, config);
			console.log("Direct API PUT response for", url, ":", response.data);
			return response.data;
		} catch (error) {
			console.error("Error in directApiClient.put:", error);
			throw error;
		}
	}

	async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
		try {
			const response = await bicycleShopAxios.delete<T>(url, config);
			console.log("Direct API DELETE response for", url, ":", response.data);
			return response.data;
		} catch (error) {
			console.error("Error in directApiClient.delete:", error);
			throw error;
		}
	}
}

export const directApiClient = new DirectAPIClient();
