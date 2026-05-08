import axios, { AxiosError } from "axios";
import type { User as FirebaseUser } from "firebase/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type AppUser = {
  uid?: string | null;
  name?: string | null;
  email?: string | null;
  photo?: string | null;
  phoneNumber?: string | null;
  plan?: string;
};

export type LoginStartResponse = {
  requiresOtp: boolean;
  user?: AppUser;
  message?: string;
};

export const getFirebaseLoginPayload = (authUser: FirebaseUser): AppUser => ({
  uid: authUser.uid,
  name: authUser.displayName || "User",
  email: authUser.email || "",
  photo: authUser.photoURL,
  phoneNumber: authUser.phoneNumber,
});

export const getLoginErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message || fallback;
};

export const startLoginAccess = async (user: AppUser) => {
  const { data } = await axios.post<LoginStartResponse>(`${API_BASE_URL}/api/auth/login/start`, user);
  return data;
};

export { API_BASE_URL };
