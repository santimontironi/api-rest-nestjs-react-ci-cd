import { confirmEmailService } from "../services/auth.service";
import { useMutation } from "@tanstack/react-query";

export const useConfirm = () => {
    return useMutation({
        mutationFn: confirmEmailService,
    });
};