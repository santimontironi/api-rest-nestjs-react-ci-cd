import { useQuery } from "@tanstack/react-query";
import { meService } from "../services/auth.service";

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: meService,
    retry: false, // retry false es para que no haga reintentos en caso de error, ya que si el usuario no está logueado, la petición fallará y no queremos que se reintente
  });
};
