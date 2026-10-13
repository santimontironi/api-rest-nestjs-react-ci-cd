import { z } from "zod";

export const paymentMethodSchema = z.enum(["CASH", "TRANSFER"], "El método de pago no es válido");

export const addSaleSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.uuid("El ID del producto no es válido"),
        quantity: z.coerce
          .number()
          .int("La cantidad debe ser un número entero")
          .positive("La cantidad debe ser mayor a 0"),
      }),
    )
    .min(1, "La venta debe tener al menos un producto")
    .refine(
      (items) => new Set(items.map((item) => item.productId)).size === items.length,
      "No se puede repetir un producto en la misma venta",
    ),
  paymentMethod: paymentMethodSchema,
  customerId: z.uuid("El ID del cliente no es válido").optional(),
});

export const salesFiltersSchema = z.object({
  from: z.iso.date("La fecha desde no es válida").optional(),
  to: z.iso.date("La fecha hasta no es válida").optional(),
  customerId: z.uuid("El ID del cliente no es válido").optional(),
});

export const saleItemSchema = z.object({
  id: z.uuid(),
  productId: z.uuid().nullable(),
  quantity: z.number(),
  unitPrice: z.number(),
  productName: z.string(),
  categoryName: z.string(),
});

export const saleSchema = z.object({
  id: z.uuid(),
  total: z.number(),
  paymentMethod: paymentMethodSchema,
  customerId: z.uuid().nullable(),
  customerName: z.string().nullable(),
  customerSurname: z.string().nullable(),
  customerPhone: z.string().nullable(),
  items: z.array(saleItemSchema),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type AddSaleInput = z.infer<typeof addSaleSchema>;
export type AddSaleFormInput = z.input<typeof addSaleSchema>;
export type SalesFilters = z.infer<typeof salesFiltersSchema>;
export type Sale = z.infer<typeof saleSchema>;
