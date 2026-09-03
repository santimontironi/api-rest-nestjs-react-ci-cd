import { z } from "zod";
import { categorySchema } from "./category.schema";

export const productSchema = z.object({
  id: z.string().uuid("El ID no es válido"),
  image: z.string().optional().nullable(),
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  stock: z.number().min(0, "El stock debe ser mayor o igual a 0"),
  categoryId: z.string().uuid("El ID de la categoría no es válido"),
  category: categorySchema,
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

// price y stock usan z.coerce.number() en vez de z.number() porque este mismo schema valida
// el valor en dos puntos donde llega como texto, no como número:
// - Frontend: el input del formulario (RHF) siempre entrega string, sea o no type="number".
// - Backend: el body llega por multipart/form-data (ZodValidationPipe), que solo transporta
//   texto y archivos, nunca tipos nativos.
// coerce convierte ese string a número antes de aplicar el .min(), evitando parsearlo a mano
// en ambos lados.

export const categoryWithProductsSchema = categorySchema.extend({
  products: z.array(productSchema),
});

export type Product = z.infer<typeof productSchema>;
export type addProductType = z.infer<typeof addProductSchema>;
export type addProductFormInput = z.input<typeof addProductSchema>;
export type CategoryWithProducts = z.infer<typeof categoryWithProductsSchema>;
export type editProductInput = z.infer<typeof addProductSchema>