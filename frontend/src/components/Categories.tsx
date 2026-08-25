import { useState } from "react"
import InputCategoryModal from "./InputCategoryModal"
import CategoryCard from "./CategoryCard"
import { useGetCategories } from "../hooks/useGetCategories"
import Loader from "./Loader"

const Categories = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: categories, isPending, isError, error } = useGetCategories()

  const isEmpty = isError && error.message === "No hay categorías agregadas."

  return (
    <div className="flex flex-col gap-8 xl:gap-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="border-l-4 border-primary pl-4">
          <h1 className="text-2xl font-bold text-tertiary md:text-3xl xl:text-4xl">
            Categorías
          </h1>
          <p className="mt-1 text-sm text-tertiary/60 md:text-base">
            Gestioná las categorías del catálogo
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-secondary shadow-[0_18px_35px_-8px] shadow-primary/40 outline-none transition-colors duration-150 hover:bg-tertiary focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary md:text-base"
        >
          <i className="bi bi-plus-lg text-base" aria-hidden="true" />
          Agregar categoría
        </button>
      </div>

      {isModalOpen && (
        <InputCategoryModal onClose={() => setIsModalOpen(false)} />
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

      {!isPending && (isEmpty || categories?.length === 0) && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-tertiary/15 bg-tertiary/5 px-6 py-16 text-center md:py-24">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <i className="bi bi-tags text-2xl" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold text-tertiary">
              Todavía no hay categorías
            </p>
            <p className="max-w-xs text-sm text-tertiary/60">
              Agregá tu primera categoría para empezar a organizar el catálogo.
            </p>
          </div>
        </div>
      )}

      {categories && categories.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Categories
