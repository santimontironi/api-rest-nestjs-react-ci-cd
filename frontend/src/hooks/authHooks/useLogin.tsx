import { useMutation } from "@tanstack/react-query";
import { loginService } from "../../services/auth.service";
import queryClient from "../../queryClient";

export const useLogin = () => {
  return useMutation({
    mutationFn: loginService,
    onSuccess: (user) => queryClient.setQueryData(["me"], user),
  });
};
