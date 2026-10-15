import { useState } from "react"
import InputCustomerModal from "./InputCustomerModal"
import EditCustomerModal from "./EditCustomerModal"
import CustomersTable from "./CustomersTable"
import { useGetCustomers } from "../../hooks/customersHooks/useGetCustomers"
import Loader from "../ui/Loader"
import type { Customer } from "../../../../shared/schemas/customer.schema"

const Customers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const { data: customers, isPending, isError, error } = useGetCustomers()

  return (
    <div className="flex flex-col gap-8 xl:gap-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="border-l-4 border-primary pl-4">
          <h1 className="text-2xl font-bold text-tertiary md:text-3xl xl:text-4xl">
            Clientes
          </h1>
          <p className="mt-1 text-sm text-tertiary/60 md:text-base">
            Gestioná los clientes frecuentes
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-secondary shadow-[0_18px_35px_-8px] shadow-primary/40 outline-none transition-colors duration-150 hover:bg-tertiary focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary md:text-base"
        >
          <i className="bi bi-plus-lg text-base" aria-hidden="true" />
          Agregar cliente
        </button>
      </div>

      {isModalOpen && (
        <InputCustomerModal onClose={() => setIsModalOpen(false)} />
      )}

      {editingCustomer && (
        <EditCustomerModal
          customer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
        />
      )}

      {customers && customers.length > 0 && (
        <p className="text-sm text-tertiary/50">
          Total de clientes: <span className="font-semibold text-tertiary/80">{customers.length}</span>
        </p>
      )}

      {isPending && (
        <div className="flex justify-center py-16">
          <Loader inline />
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-dashed border-tertiary/15 bg-tertiary/5 px-6 py-16 text-center">
          <p className="text-sm text-red-500">{error.message}</p>
        </div>
      )}

      {!isPending && customers?.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-tertiary/15 bg-tertiary/5 px-6 py-16 text-center md:py-24">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <i className="bi bi-people text-2xl" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold text-tertiary">
              Todavía no hay clientes
            </p>
            <p className="max-w-xs text-sm text-tertiary/60">
              Agregá tu primer cliente frecuente para empezar a llevar su historial.
            </p>
          </div>
        </div>
      )}

      {customers && customers.length > 0 && (
        <CustomersTable
          customers={customers}
          onEditClick={(customer) => setEditingCustomer(customer)}
        />
      )}
    </div>
  )
}

export default Customers
