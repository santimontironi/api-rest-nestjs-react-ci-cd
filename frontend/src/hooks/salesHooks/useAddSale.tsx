import { useMutation } from "@tanstack/react-query";
import { addSaleService } from "../../services/sale.service";
import queryClient from "../../queryClient";

export const useAddSale = () => {
  return useMutation({
    mutationFn: addSaleService,
    // Una venta descuenta stock (productos y detalle de categoría) y suma al conteo de ventas del cliente.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};
