import { z } from "zod";

export const addCategorySchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio')
})

export type AddCategoryInput = z.infer<typeof addCategorySchema>;