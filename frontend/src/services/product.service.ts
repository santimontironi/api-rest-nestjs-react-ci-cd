import { productSchema } from "../../../shared/schemas/product.schema";
import api from "./api";
import type { addProductPayload } from "../types/product.types";

export const addProductService = async ({ image, ...data }: addProductPayload) => {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("description", data.description);
  formData.append("price", String(data.price));
  formData.append("stock", String(data.stock));
  formData.append("categoryId", data.categoryId);
  formData.append("image", image);

  const response = await api.post("/products", formData);
  return productSchema.parse(response.data);
};

export const getProductsService = async () => {
  const response = await api.get('/products')
  return productSchema.array().parse(response.data)
}
