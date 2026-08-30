import { useMutation } from "@tanstack/react-query";
import { deleteProduct } from "../../services/product.service";
import queryClient from "../../queryClient";

export const useDeleteProduct = () => {
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
};
