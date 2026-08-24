import { addCategorySchema } from "../../../shared/schemas/category.schema";
import {z} from "zod"

export type categoryCredential = z.infer<typeof addCategorySchema>