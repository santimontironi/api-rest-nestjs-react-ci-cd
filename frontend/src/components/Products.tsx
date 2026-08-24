import { useState } from "react"
import InputProductModal from "./InputProductModal"
import { useGetProducts } from "../hooks/useGetProducts"
import Loader from "./Loader"

const Products = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: products, isPending, isError, error } = useGetProducts()

  const isEmpty = isError && error.message === "No hay productos agregados."

  return (
    <div className="flex flex-col gap-8 xl:gap-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="border-l-4 border-primary pl-4">
          <h1 className="text-2xl font-bold text-tertiary md:text-3xl xl:text-4xl">
            Productos
          </h1>
          <p className="mt-1 text-sm text-tertiary/60 md:text-base">
            Gestioná el catálogo de productos
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-secondary shadow-[0_18px_35px_-8px] shadow-primary/40 outline-none transition-colors duration-150 hover:bg-tertiary focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary md:text-base"
        >
          <i className="bi bi-plus-lg text-base" aria-hidden="true" />
          Agregar producto
        </button>
      </div>

      {isModalOpen && (
        <InputProductModal onClose={() => setIsModalOpen(false)} />
      )}

      {isPending && (
        <div className="flex justify-center py-16">
          <Loader inline />
        </div>
      )}

      {isError && !isEmpty && (
        <div className="rounded-2xl border border-dashed border-tertiary/15 bg-tertiary/5 px-6 py-16 text-center">
          <p className="text-sm text-red-500">{error.message}</p>
        </div>
      )}

      {!isPending && (isEmpty || products?.length === 0) && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-tertiary/15 bg-tertiary/5 px-6 py-16 text-center md:py-24">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <i className="bi bi-box-seam text-2xl" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold text-tertiary">
              Todavía no hay productos
            </p>
            <p className="max-w-xs text-sm text-tertiary/60">
              Agregá tu primer producto para empezar a construir el catálogo.
            </p>
          </div>
        </div>
      )}

      {products && products.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-col gap-2 rounded-2xl border border-tertiary/10 bg-secondary p-5 shadow-[0_10px_30px_-15px] shadow-tertiary/30"
            >
              <p className="text-base font-semibold text-tertiary">{product.name}</p>
              <p className="line-clamp-2 text-sm text-tertiary/60">{product.description}</p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-primary">${product.price.toFixed(2)}</span>
                <span className="text-tertiary/60">Stock: {product.stock}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Products
