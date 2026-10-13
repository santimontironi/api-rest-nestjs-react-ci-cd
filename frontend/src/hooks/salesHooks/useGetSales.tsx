import { useQuery } from "@tanstack/react-query";
import { getSalesService } from "../../services/sale.service";
import type { SalesFilters } from "../../../../shared/schemas/sale.schema";

export const useGetSales = (filters: SalesFilters) => {
  return useQuery({
    queryKey: ["sales", filters],
    queryFn: () => getSalesService(filters),
    retry: false,
  });
};
