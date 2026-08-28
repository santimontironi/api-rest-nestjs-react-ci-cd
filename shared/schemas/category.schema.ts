import { z } from "zod";

export const categorySchema = z.object({
  id: z.string().uuid("El ID no es válido"),
  name: z.string().min(1, "El nombre es obligatorio"),
  createdAt: z.coerce.date(),
  _count: z.object({ products: z.number() }).optional(),
});

export const addCategorySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
});

export type Category = z.infer<typeof categorySchema>;
export type AddCategoryInput = z.infer<typeof addCategorySchema>;
