import { useMutation } from "@tanstack/react-query";
import { addCategoryService } from "../services/category.service";
import queryClient from "../queryClient";

export const useAddCategory = () => {
  return useMutation({
    mutationFn: addCategoryService,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
};
