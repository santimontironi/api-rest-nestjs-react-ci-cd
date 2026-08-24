import { z } from "zod";
import { addProductSchema } from "../../../shared/schemas/product.schema";

export type addProductCredentials = z.infer<typeof addProductSchema>;
export type addProductFormInput = z.input<typeof addProductSchema>;
export type addProductPayload = addProductCredentials & { image: File };
