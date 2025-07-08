import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";
import type { User } from "../types/user";

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  skills?: number[];
}

interface AuthResponse {
  access: string;
  refresh: string;
  user?: User;
}

interface OAuthData {
  access_token: string;
  redirect_uri: string;
}

type GitHubAuthParams = {
  code: string;
  state: string;
  redirect_uri: string;
};


const loginUser = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await api.post("/auth/login/", credentials);
  return response.data;
};

const signupUser = async (data: SignupData): Promise<AuthResponse> => {
  const response = await api.post("/auth/register/", data);
  return response.data;
};

// OAuth authentication functions
const authenticateWithGoogle = async (
  data: OAuthData
): Promise<AuthResponse> => {
  const response = await api.post("/auth/dj-rest-auth/google/", data);
  return response.data;
};

const authenticateWithGitHub = async (
  data : GitHubAuthParams
): Promise<AuthResponse> => {
  const response = await api.post("/auth/dj-rest-auth/github/", {
    code: data.code,
    state: data.state,
    redirect_uri: data.redirect_uri,
  });
  return response.data;
};

const setUser = useAuthStore.getState().setUser;

export const useLogin = () => {
  const queryClient = useQueryClient();
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      setTokens(data.access, data.refresh);
      // Fetch user profile and set in store
      const userRes = await api.get('/auth/profile/');
      setUser(userRes.data);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: any) => {
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error("Invalid email or password");
      }
      throw error;
    },
  });
};

export const useSignup = () => {
  const queryClient = useQueryClient();
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation({
    mutationFn: signupUser,
    onSuccess: async (data) => {
      setTokens(data.access, data.refresh);
      // Fetch user profile and set in store
      const userRes = await api.get('/auth/profile/');
      setUser(userRes.data);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: any) => {
      // Handle validation errors
      if (error.response?.status === 400) {
        const validationErrors = error.response.data;
        const errorMessages = Object.entries(validationErrors)
          .map(
            ([field, messages]) =>
              `${field}: ${
                Array.isArray(messages) ? messages.join(", ") : messages
              }`
          )
          .join("\n");
        throw new Error(errorMessages);
      }
      throw error;
    },
  });
};

export const useGoogleAuth = () => {
  const queryClient = useQueryClient();
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation({
    mutationFn: authenticateWithGoogle,
    onSuccess: async (data) => {
      setTokens(data.access, data.refresh);
      // Fetch user profile and set in store
      const userRes = await api.get('/auth/profile/');
      setUser(userRes.data);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: any) => {
      if (error.response?.status === 400) {
        throw new Error("Google authentication failed. Please try again.");
      }
      throw error;
    },
  });
};


export const useGitHubAuth = () => {
  const queryClient = useQueryClient();
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation({
    mutationFn: authenticateWithGitHub,
    onSuccess: async (data) => {
      setTokens(data.access, data.refresh);
      // Fetch user profile and set in store
      const userRes = await api.get('/auth/profile/');
      setUser(userRes.data);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: any) => {
      if (error.response?.status === 400) {
        throw new Error("GitHub authentication failed. Please try again.");
      }
      throw error;
    },
  });
};
