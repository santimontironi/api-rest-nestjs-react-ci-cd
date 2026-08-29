import { useQuery } from "@tanstack/react-query";
import { getCategoriesService } from "../../services/category.service";

export const useGetCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesService,
    retry: false,
  });
};
