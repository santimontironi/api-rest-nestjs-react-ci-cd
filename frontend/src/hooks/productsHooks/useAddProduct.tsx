import { useMutation } from "@tanstack/react-query";
import { addProductService } from "../../services/product.service";
import queryClient from "../../queryClient";

export const useAddProduct = () => {
  return useMutation({
    mutationFn: addProductService,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }), //invalidateQueries marca los datos en caché como obsoletos (stale) y activa una nueva petición en segundo plano si la consulta está activa en pantalla. de esta forma se actualizan los datos sin tener que recargar la pantalla
  });
};
