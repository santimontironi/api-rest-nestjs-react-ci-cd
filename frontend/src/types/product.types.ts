import type { addProductType } from "../../../shared/schemas/product.schema";

export type addProductPayload = addProductType & { image: File | null };
