import { useMutation } from "@tanstack/react-query";
import { addProductService } from "../services/product.service";
import queryClient from "../queryClient";

export const useAddProduct = () => {
  return useMutation({
    mutationFn: addProductService,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
};
