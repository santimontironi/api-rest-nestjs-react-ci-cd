import { useMutation } from "@tanstack/react-query";
import { loginService } from "../../services/auth.service";
import queryClient from "../../queryClient";

export const useLogin = () => {
  return useMutation({
    mutationFn: loginService,
    // invalidateQueries no alcanza acá: marcaría ["me"] como stale, pero hasta que se
    // dispare el refetch de GET /auth/me la sesión sigue sin usuario en cache, y hay
    // pantallas (redirect post-login, guards de rutas) que necesitan ese usuario ya.
    // setQueryData escribe el usuario que ya vino en la respuesta del login al toque,
    // sin esperar ese round-trip extra contra el server.
    onSuccess: (user) => queryClient.setQueryData(["me"], user),
  });
};
