import { useMutation } from "@tanstack/react-query";
import { logoutService } from "../../services/auth.service";
import queryClient from "../../queryClient";

export const useLogout = () => {
  return useMutation({
    mutationFn: logoutService,
    onSuccess: () => queryClient.setQueryData(["me"], null),
  });
};
