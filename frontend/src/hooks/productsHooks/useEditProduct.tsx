import { useMutation } from "@tanstack/react-query";
import { editProductService } from "../../services/product.service";
import queryClient from "../../queryClient";
import type { editProductPayload } from "../../types/product.types";

export const useEditProduct = () => {
  return useMutation({
    mutationFn: ({ id, ...data }: editProductPayload & { id: string }) => editProductService(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
};
