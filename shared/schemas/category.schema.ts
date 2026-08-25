import { z } from "zod";
import { productSchema } from "./product.schema";

export const categorySchema = z.object({
  id: z.string().uuid("El ID no es válido"),
  name: z.string().min(1, "El nombre es obligatorio"),
  createdAt: z.coerce.date(),
});

export const categoryWithProductsSchema = categorySchema.extend({
  products: z.array(productSchema),
});

export const addCategorySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
});

export type Category = z.infer<typeof categorySchema>;
export type CategoryWithProducts = z.infer<typeof categoryWithProductsSchema>;
export type AddCategoryInput = z.infer<typeof addCategorySchema>;
