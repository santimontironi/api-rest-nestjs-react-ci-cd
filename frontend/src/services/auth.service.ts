import api from "./api";
import { userSchema, type LoginInput, type ForgotPasswordInput, type ResetPasswordInput } from "../../../shared/schemas/auth.schema";

export const loginService = async (credentials: LoginInput) => {
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

export const forgotPasswordService = async (credentials: ForgotPasswordInput) => {
    const response = await api.post("/auth/forgot-password", credentials);
    return response.data;
}

export const resetPasswordService = async ({ token, ...credentials }: ResetPasswordInput & { token: string }) => {
    const response = await api.post(`/auth/reset-password/${token}`, credentials);
    return response.data;
}