import { useMutation } from "@tanstack/react-query";
import { deleteCategoryService } from "../../services/category.service";
import queryClient from "../../queryClient";

export const useDeleteCategory = () => {
  return useMutation({
    mutationFn: deleteCategoryService,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
};
