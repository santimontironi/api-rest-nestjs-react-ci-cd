import { useMutation } from "@tanstack/react-query";
import { deleteCustomerService } from "../../services/customer.service";
import queryClient from "../../queryClient";

export const useDeleteCustomer = () => {
  return useMutation({
    mutationFn: deleteCustomerService,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });
};
