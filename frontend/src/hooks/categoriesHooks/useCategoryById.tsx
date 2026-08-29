import { useQuery } from "@tanstack/react-query";
import { getCategoryByIdService } from "../../services/category.service";

export const useCategoryById = (id: string) => {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: () => getCategoryByIdService(id),
    retry: false,
  });
};
