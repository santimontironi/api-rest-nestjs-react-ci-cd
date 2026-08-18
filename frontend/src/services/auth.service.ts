import api from "./api";
import type { LoginCredentials } from "../types/auth.types";
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