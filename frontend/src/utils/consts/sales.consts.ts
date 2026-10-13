import type { Sale } from "../../../../shared/schemas/sale.schema";

export const PAYMENT_METHOD_LABELS: Record<Sale["paymentMethod"], string> = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
};
