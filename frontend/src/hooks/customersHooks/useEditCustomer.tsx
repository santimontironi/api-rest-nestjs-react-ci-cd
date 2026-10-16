import { useMutation } from "@tanstack/react-query";
import { editCustomerService } from "../../services/customer.service";
import queryClient from "../../queryClient";
import type { EditCustomerInput } from "../../../../shared/schemas/customer.schema";

export const useEditCustomer = () => {
  return useMutation({
    mutationFn: ({ id, ...data }: EditCustomerInput & { id: string }) => editCustomerService(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });
};
