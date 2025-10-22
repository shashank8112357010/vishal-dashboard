import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { toast } from "sonner";
import type { Result } from "#/api";
import { ResultStatus } from "#/enum";
import { GLOBAL_CONFIG } from "@/global-config";
import { t } from "@/locales/i18n";
import userStore from "@/store/userStore";

const axiosInstance = axios.create({
	baseURL: GLOBAL_CONFIG.apiBaseUrl,
	timeout: 50000,
	headers: { "Content-Type": "application/json;charset=utf-8" },
});

axiosInstance.interceptors.request.use(
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

axiosInstance.interceptors.response.use(
	(res: AxiosResponse<Result<any>>) => {
		if (!res.data) throw new Error(t("sys.api.apiRequestFailed"));
		const { status, data, message } = res.data;
		if (status === ResultStatus.SUCCESS) {
			return data;
		}
		throw new Error(message || t("sys.api.apiRequestFailed"));
	},
	(error: AxiosError<Result>) => {
		const { response, message, config } = error || {};
		const errMsg = response?.data?.message || message || t("sys.api.errorMessage");

		// Handle 401 Unauthorized - Clear user state and redirect to login
		// But skip this for auth endpoints (login, signup, refresh) to show proper error messages
		const isAuthEndpoint =
			config?.url?.includes("/auth/signin") ||
			config?.url?.includes("/auth/signup") ||
			config?.url?.includes("/auth/refresh");

		if (response?.status === 401 && !isAuthEndpoint) {
			userStore.getState().actions.clearUserInfoAndToken();
			toast.error("Session expired. Please login again.", { position: "top-center" });

			// Redirect to login page
			// Use window.location to ensure a full page reload and clear any stale state
			if (!window.location.pathname.includes("/login")) {
				window.location.href = "/login";
			}
			return Promise.reject(error);
		}

		// Show error toast for all other errors (including auth endpoint errors)
		toast.error(errMsg, { position: "top-center" });
		return Promise.reject(error);
	},
);

class APIClient {
	get<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "GET" });
	}
	post<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "POST" });
	}
	put<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "PUT" });
	}
	delete<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "DELETE" });
	}
	request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return axiosInstance.request<any, T>(config);
	}
}

export default new APIClient();
