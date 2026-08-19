import { useMutation } from "@tanstack/react-query";
import { resetPasswordService } from "../services/auth.service";

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPasswordService,
  });
};
