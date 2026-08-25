import api from "./api";
import { categorySchema, type AddCategoryInput } from "../../../shared/schemas/category.schema";

export const addCategoryService = async (data: AddCategoryInput) => {
    const response = await api.post('/categories', data)
    return categorySchema.parse(response.data)
}

export const getCategoriesService = async () => {
    const response = await api.get('/categories')
    return categorySchema.array().parse(response.data)
}

