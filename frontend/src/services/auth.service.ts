import api from "./api";
import type { RegisterCredentials } from "../types/auth.types";

export const registerService = async (credentials: RegisterCredentials) => {
    await api.post("/auth/register", credentials);
}

export const confirmEmailService = async (token: string) => {
    await api.get(`/auth/confirm-email/${token}`);
}