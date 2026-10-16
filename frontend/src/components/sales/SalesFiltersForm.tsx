import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { salesFiltersSchema, type SalesFilters } from "../../../../shared/schemas/sale.schema";
import { useGetCustomers } from "../../hooks/customersHooks/useGetCustomers";

const inputClassName =
  "h-11 w-full rounded-lg border border-tertiary/10 bg-tertiary/5 px-3.5 text-base text-tertiary transition-colors duration-150 outline-none focus-visible:border-primary focus-visible:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/20";

// Los inputs vacíos llegan como "", que no pasa la validación de fecha/uuid: se mandan como undefined.
const emptyToUndefined = { setValueAs: (value: string) => value || undefined };

const SalesFiltersForm = ({ onApply }: { onApply: (filters: SalesFilters) => void }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SalesFilters>({
    resolver: zodResolver(salesFiltersSchema),
  });

  const { data: customers } = useGetCustomers();

  const handleClear = () => {
    reset({ from: undefined, to: undefined, customerId: undefined });
    onApply({});
  };

  return (
    <form
      onSubmit={handleSubmit(onApply)}
      className="grid grid-cols-1 gap-4 rounded-2xl border border-tertiary/10 bg-secondary p-5 shadow-[0_10px_30px_-15px] shadow-tertiary/30 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.5fr_auto] xl:items-end"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="from" className="text-left text-sm font-medium text-tertiary/60">
          Desde
        </label>
        <input id="from" type="date" className={inputClassName} {...register("from", emptyToUndefined)} />
        {errors.from && <span className="text-xs text-red-500">{errors.from.message}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="to" className="text-left text-sm font-medium text-tertiary/60">
          Hasta
        </label>
        <input id="to" type="date" className={inputClassName} {...register("to", emptyToUndefined)} />
        {errors.to && <span className="text-xs text-red-500">{errors.to.message}</span>}
      </div>

      <div className="flex flex-col gap-1.5 md:col-span-2 xl:col-span-1">
        <label htmlFor="filterCustomerId" className="text-left text-sm font-medium text-tertiary/60">
          Cliente
        </label>
        <select id="filterCustomerId" className={inputClassName} {...register("customerId", emptyToUndefined)}>
          <option value="">Todos los clientes</option>
          {customers?.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} {customer.surname}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 md:col-span-2 xl:col-span-1">
        <button
          type="button"
          onClick={handleClear}
          className="flex h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border border-tertiary/15 px-5 text-sm font-semibold text-tertiary/60 outline-none transition-colors duration-150 hover:border-tertiary/25 hover:text-tertiary focus-visible:ring-2 focus-visible:ring-primary/50 xl:flex-none"
        >
          Limpiar
        </button>
        <button
          type="submit"
          className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-tertiary px-5 text-sm font-semibold text-secondary outline-none transition-colors duration-150 hover:bg-primary focus-visible:ring-2 focus-visible:ring-primary/50 xl:flex-none"
        >
          <i className="bi bi-funnel" aria-hidden="true" />
          Filtrar
        </button>
      </div>
    </form>
  );
};

export default SalesFiltersForm;
