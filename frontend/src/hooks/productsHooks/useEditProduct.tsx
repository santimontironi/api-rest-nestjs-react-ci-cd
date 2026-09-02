import { useMutation } from "@tanstack/react-query";
import { editProductService } from "../../services/product.service";
import queryClient from "../../queryClient";

export const useEditProduct = () => {
  return useMutation({
    mutationFn: editProductService,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
};
