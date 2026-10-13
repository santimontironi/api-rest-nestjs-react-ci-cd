import api from "./api";
import { saleSchema, type AddSaleInput, type SalesFilters } from "../../../shared/schemas/sale.schema";

export const getSalesService = async (filters: SalesFilters) => {
  const response = await api.get("/sales", { params: filters });
  return saleSchema.array().parse(response.data);
};

export const addSaleService = async (data: AddSaleInput) => {
  const response = await api.post("/sales", data);
  return saleSchema.parse(response.data);
};
