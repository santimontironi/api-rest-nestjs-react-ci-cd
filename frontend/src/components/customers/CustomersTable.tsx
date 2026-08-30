import swal from "../../utils/swal";
import type { Customer } from "../../../../shared/schemas/customer.schema";
import { useDeleteCustomer } from "../../hooks/customersHooks/useDeleteCustomer";

const CustomersTable = ({ customers }: { customers: Customer[] }) => {
  const { mutate: deleteCustomer } = useDeleteCustomer();

  const handleDelete = (customer: Customer) => {
    swal.fire({
      title: "¿Eliminar cliente?",
      text: `Se eliminará a "${customer.name} ${customer.surname}". Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (!result.isConfirmed) return;

      deleteCustomer(customer.id, {
        onSuccess: () =>
          swal.fire({
            title: "Cliente eliminado",
            icon: "success",
            timer: 1800,
            showConfirmButton: false,
          }),
        onError: (error) =>
          swal.fire({
            title: "No se pudo eliminar",
            text: error.message,
            icon: "error",
          }),
      });
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:hidden">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="flex flex-col gap-3 rounded-2xl border border-tertiary/10 bg-secondary p-5 shadow-[0_10px_30px_-15px] shadow-tertiary/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-base font-semibold text-tertiary">
                  {customer.name} {customer.surname}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-tertiary/60">
                  <i className="bi bi-telephone" aria-hidden="true" />
                  {customer.phone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(customer)}
                aria-label={`Eliminar ${customer.name} ${customer.surname}`}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-tertiary/50 outline-none transition-colors duration-150 hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <i className="bi bi-trash3 text-sm" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 border-t border-tertiary/10 pt-3 text-xs text-tertiary/60">
              <i className="bi bi-bag-check" aria-hidden="true" />
              Ventas: {customer._count?.sales ?? 0}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-tertiary/10 bg-secondary shadow-[0_10px_30px_-15px] shadow-tertiary/30 xl:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 border-collapse text-left">
            <thead>
              <tr className="border-b border-tertiary/10 bg-tertiary/5">
                <th
                  scope="col"
                  className="px-4 py-3 text-xs font-semibold text-primary md:px-6"
                >
                  Cliente
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-xs font-semibold text-primary md:px-6"
                >
                  Teléfono
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-semibold text-primary md:px-6"
                >
                  Ventas
                </th>
                <th scope="col" className="w-14 px-4 py-3 md:px-6">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tertiary/10">
              {customers.map((customer) => (
                <tr
                  key={`row-${customer.id}`}
                  className="group transition-colors duration-150 hover:bg-primary"
                >
                  <td className="px-4 py-3 text-sm font-semibold text-tertiary transition-colors duration-150 group-hover:text-secondary md:px-6 md:text-base">
                    {customer.name} {customer.surname}
                  </td>
                  <td className="px-4 py-3 text-sm text-tertiary/60 transition-colors duration-150 group-hover:text-secondary/70 md:px-6">
                    {customer.phone}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-tertiary transition-colors duration-150 group-hover:text-secondary md:px-6">
                    {customer._count?.sales ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right md:px-6">
                    <button
                      type="button"
                      onClick={() => handleDelete(customer)}
                      aria-label={`Eliminar ${customer.name} ${customer.surname}`}
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-tertiary/50 outline-none transition-colors duration-150 group-hover:text-secondary hover:bg-secondary hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                      <i className="bi bi-trash3 text-base" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default CustomersTable;
