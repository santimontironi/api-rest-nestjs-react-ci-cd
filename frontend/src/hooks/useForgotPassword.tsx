import { useMutation } from "@tanstack/react-query";
import { forgotPasswordService } from "../services/auth.service";

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPasswordService,
  });
};
