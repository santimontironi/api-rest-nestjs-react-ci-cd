import { useMutation } from "@tanstack/react-query";
import { registerService } from "../services/auth.service";

export const useRegister = () => {
    return useMutation({
        mutationFn: registerService
    });
};