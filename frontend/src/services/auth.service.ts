import api from "./api";
import type { LoginCredentials, ForgotPasswordCredentials, ResetPasswordCredentials } from "../types/auth.types";
import { userSchema } from "../../../shared/schemas/auth.schema";

export const loginService = async (credentials: LoginCredentials) => {
    const response = await api.post("/auth/login", credentials);
    return userSchema.parse(response.data);
}

export const meService = async () => {
    const response = await api.get("/auth/me");
    return userSchema.parse(response.data);
}

export const logoutService = async () => {
    const response = await api.post("/auth/logout");
    return response.data;
}

export const forgotPasswordService = async (credentials: ForgotPasswordCredentials) => {
    const response = await api.post("/auth/forgot-password", credentials);
    return response.data;
}

export const resetPasswordService = async ({ token, ...credentials }: ResetPasswordCredentials & { token: string }) => {
    const response = await api.post(`/auth/reset-password/${token}`, credentials);
    return response.data;
}