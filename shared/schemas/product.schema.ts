import { z } from "zod";

export const productSchema = z.object({
  id: z.string().uuid("El ID no es válido"),
  image: z.string().optional(),
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  stock: z.number().min(0, "El stock debe ser mayor o igual a 0"),
  categoryId: z.string().uuid("El ID de la categoría no es válido"),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const addProductSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  price: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
  stock: z.coerce.number().min(0, "El stock debe ser mayor o igual a 0"),
  categoryId: z.string().uuid("El ID de la categoría no es válido"),
});

export type addProductType = z.infer<typeof addProductSchema>;
