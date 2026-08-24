import api from "./api";
import { categorySchema } from "../../../shared/schemas/category.schema";
import type { categoryCredential } from "../types/category.types";

export const addCategoryService = async (data: categoryCredential) => {
    const response = await api.post('/categories', data)
    return categorySchema.parse(response.data)
}

export const getCategoriesService = async () => {
    const response = await api.get('/categories')
    return categorySchema.array().parse(response.data)
}

