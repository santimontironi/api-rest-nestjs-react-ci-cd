import { useMutation } from "@tanstack/react-query";
import { addCustomerService } from "../../services/customer.service";
import queryClient from "../../queryClient";

export const useAddCustomer = () => {
  return useMutation({
    mutationFn: addCustomerService,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });
};
