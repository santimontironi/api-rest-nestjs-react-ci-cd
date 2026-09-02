import type { addProductType, editProductInput } from "../../../shared/schemas/product.schema";

export type addProductPayload = addProductType & { image: File | null };
export type editProductPayload = editProductInput & { id: string; image: File | null };
