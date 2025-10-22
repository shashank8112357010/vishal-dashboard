import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import { GLOBAL_CONFIG } from "@/global-config";

// Create a separate axios instance for our bicycle shop backend
const bicycleShopAxios = axios.create({
	baseURL: GLOBAL_CONFIG.apiBaseUrl,
	timeout: 50000,
	headers: { "Content-Type": "application/json;charset=utf-8" },
});

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
