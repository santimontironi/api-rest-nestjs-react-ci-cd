import { z } from "zod";

export const addCustomerSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  surname: z.string().min(1, "El apellido es obligatorio"),
  phone: z.string().min(1, "El teléfono es obligatorio"),
});

export const customerSchema = addCustomerSchema.extend({
  id: z.string().uuid("El ID no es válido"),
  _count: z.object({ sales: z.number() }).optional(),
});

export type AddCustomerInput = z.infer<typeof addCustomerSchema>;
export type Customer = z.infer<typeof customerSchema>;
