import type { addProductType, editProductInput } from "../../../shared/schemas/product.schema";

export type addProductPayload = addProductType & { image: File | null };
export type editProductPayload = editProductInput & { image: File | null };
