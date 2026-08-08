import { registerSchema } from "../../../shared/schemas/auth.schema";
import { z } from "zod";

export type RegisterCredentials = z.infer<typeof registerSchema>;