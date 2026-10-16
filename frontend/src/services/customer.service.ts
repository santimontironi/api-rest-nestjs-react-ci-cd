import api from "./api";
import { customerSchema, type AddCustomerInput, type EditCustomerInput } from "../../../shared/schemas/customer.schema";

export const getCustomersService = async () => {
    const response = await api.get("/customers");
    return customerSchema.array().parse(response.data);
};

export const addCustomerService = async (data: AddCustomerInput) => {
    const response = await api.post("/customers", data);
    return customerSchema.parse(response.data);
};

export const editCustomerService = async (id: string, data: EditCustomerInput) => {
    const response = await api.patch(`/customers/${id}`, data);
    return customerSchema.parse(response.data);
};

export const deleteCustomerService = async (id: string) => {
    const response = await api.delete(`/customers/${id}`);
    return customerSchema.parse(response.data);
};