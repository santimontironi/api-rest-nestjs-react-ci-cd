import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    email: z.string().email('El email no es válido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    surname: z.string().min(1, 'El apellido es obligatorio'),
});

export const loginSchema = z.object({
    email: z.string().email('El email no es válido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export const loginSchemaResponse = z.object({
    id: z.string().uuid('El ID no es válido'),
    email: z.string().email('El email no es válido'),
    name: z.string().min(1, 'El nombre es obligatorio'),
    surname: z.string().min(1, 'El apellido es obligatorio'),
})

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
