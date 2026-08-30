import api from "./api";
import { categorySchema, type AddCategoryInput } from "../../../shared/schemas/category.schema";
import { categoryWithProductsSchema } from "../../../shared/schemas/product.schema";

export const addCategoryService = async (data: AddCategoryInput) => {
    const response = await api.post('/categories', data)
    return categorySchema.parse(response.data)
}

export const getCategoriesService = async () => {
    const response = await api.get('/categories')
    return categorySchema.array().parse(response.data)
}

export const getCategoryByIdService = async (id: string) => {
    const response = await api.get(`/categories/${id}`)
    return categoryWithProductsSchema.parse(response.data)
}

export const deleteCategoryService = async (id: string) => {
    const response = await api.delete(`/categories/${id}`)
    return categorySchema.parse(response.data)
}