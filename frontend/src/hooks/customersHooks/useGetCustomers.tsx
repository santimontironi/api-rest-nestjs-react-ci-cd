import { useQuery } from "@tanstack/react-query";
import { getCustomersService } from "../../services/customer.service";

export const useGetCustomers = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: getCustomersService,
    retry: false,
  });
};
