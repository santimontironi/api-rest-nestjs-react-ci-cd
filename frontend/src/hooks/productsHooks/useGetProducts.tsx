import { useQuery } from "@tanstack/react-query";
import { getProductsService } from "../../services/product.service";

export const useGetProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: getProductsService,
    retry: false,
  });
};
