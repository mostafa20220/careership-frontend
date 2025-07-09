import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { useAuthStore } from "../store/authStore";

interface ErrorResponse {
  message?: string;
  [key: string]: unknown;
}

// Create base URL from environment variable or use default
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000, // 10 seconds
  withCredentials: false, // JWT-only authentication for cross-domain
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get access token from auth store
    const accessToken = useAuthStore.getState().accessToken;

    // If token exists, add it to headers
    if (accessToken) {
      config.headers.Authorization = `JWT ${accessToken}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest.url?.includes("/login")
    ) {
      // Clear auth state
      useAuthStore.getState().logout();

      // Redirect to login page
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Handle other errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = error.response.data?.message || "An error occurred";
      console.error("API Error:", errorMessage);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Network Error:", "No response received from server");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Helper function to handle API errors
export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError<ErrorResponse>(error)) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message || error.message || "An error occurred";
    return new ApiError(status, message, error.response?.data);
  }
  return new ApiError(500, "An unexpected error occurred");
};

// Skills API
export const fetchSkills = () => api.get("/auth/skills/");
export const fetchUserSkills = () => api.get("/auth/user-skills/");
export const addUserSkill = (skill_id: number) =>
  api.post("/auth/user-skills/", { skill_id });
export const removeUserSkill = (skill_id: number) =>
  api.delete(`/auth/user-skills/${skill_id}/`);

// Project submissions API
export const fetchProjectSubmissions = (
  projectId: string | number,
  taskId?: string | number
) => {
  let url;
  if (taskId) {
    // For task-specific submissions: /projects/1/tasks/1/submissions
    url = `/projects/${projectId}/tasks/${taskId}/submissions/`;
  } else {
    // For project-level submissions: /projects/1/submissions
    url = `/projects/${projectId}/submissions/`;
  }
  return api.get(url);
};

export const createSubmission = (
  projectId: string | number,
  taskId: string | number,
  data: { team: string; deployment_url?: string; github_url?: string }
) => {
  return api.post(`/projects/${projectId}/tasks/${taskId}/submissions/`, data);
};

export const fetchSubmissionDetail = (
  projectId: string | number,
  taskId: string | number,
  submissionId: string | number
) => {
  return api.get(
    `/projects/${projectId}/tasks/${taskId}/submissions/${submissionId}`
  );
};

// Categories and Difficulties API
export const fetchCategories = () => api.get("/categories/");
export const fetchDifficulties = () => api.get("/difficulties/");

export default api;
