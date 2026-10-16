import { useState } from "react"
import InputSaleModal from "./InputSaleModal"
import SalesFiltersForm from "./SalesFiltersForm"
import SalesTable from "./SalesTable"
import { useGetSales } from "../../hooks/salesHooks/useGetSales"
import Loader from "../ui/Loader"
import type { SalesFilters } from "../../../../shared/schemas/sale.schema"

const Sales = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filters, setFilters] = useState<SalesFilters>({})
  const { data: sales, isPending, isError, error } = useGetSales(filters)

  return (
    <div className="flex flex-col gap-8 xl:gap-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="border-l-4 border-primary pl-4">
          <h1 className="text-2xl font-bold text-tertiary md:text-3xl xl:text-4xl">
            Ventas
          </h1>
          <p className="mt-1 text-sm text-tertiary/60 md:text-base">
            Registrá ventas y consultá el historial
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-secondary shadow-[0_18px_35px_-8px] shadow-primary/40 outline-none transition-colors duration-150 hover:bg-tertiary focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary md:text-base"
        >
          <i className="bi bi-plus-lg text-base" aria-hidden="true" />
          Registrar venta
        </button>
      </div>

      {isModalOpen && (
        <InputSaleModal onClose={() => setIsModalOpen(false)} />
      )}

      <SalesFiltersForm onApply={setFilters} />

      {sales && sales.length > 0 && (
        <p className="text-sm text-tertiary/50">
          {sales.length} {sales.length === 1 ? "venta" : "ventas"} · Total:{" "}
          <span className="font-semibold text-tertiary/80">
            ${sales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}
          </span>
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

      {!isPending && sales?.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-tertiary/15 bg-tertiary/5 px-6 py-16 text-center md:py-24">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <i className="bi bi-receipt text-2xl" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold text-tertiary">
              No hay ventas para mostrar
            </p>
            <p className="max-w-xs text-sm text-tertiary/60">
              Registrá una venta o cambiá los filtros para ver resultados.
            </p>
          </div>
        </div>
      )}

      {sales && sales.length > 0 && <SalesTable sales={sales} />}
    </div>
  )
}

export default Sales
