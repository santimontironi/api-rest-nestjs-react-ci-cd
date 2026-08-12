import { loginSchema } from "../../../shared/schemas/auth.schema";
import { z } from "zod";

export type LoginCredentials = z.infer<typeof loginSchema>;