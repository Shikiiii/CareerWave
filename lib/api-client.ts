import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/auth/login") &&
      !originalRequest?.url?.includes("/auth/register") &&
      !originalRequest?.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        await apiClient.post("/auth/refresh");
        return apiClient(originalRequest);
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong.") {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error ?? error.response?.data?.message ?? fallback;
  }

  if (error instanceof Error) return error.message;
  return fallback;
}
