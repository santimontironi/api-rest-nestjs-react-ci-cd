import { useQuery } from "@tanstack/react-query";
import { getProductByIdService } from "../../services/product.service";

export const useProductById = (id: string) => {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => getProductByIdService(id),
    retry: false,
  });
};
