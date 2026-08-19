import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../../../shared/schemas/auth.schema";
import { z } from "zod";

export type LoginCredentials = z.infer<typeof loginSchema>;
export type ForgotPasswordCredentials = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordCredentials = z.infer<typeof resetPasswordSchema>;