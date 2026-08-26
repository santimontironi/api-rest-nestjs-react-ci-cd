import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAddProduct } from "../hooks/useAddProduct";
import { useGetCategories } from "../hooks/useGetCategories";
import type { addProductCredentials, addProductFormInput } from "../types/product.types";
import { addProductSchema } from "../../../shared/schemas/product.schema";
import Loader from "./Loader";

const InputProductModal = ({ onClose }: { onClose: () => void }) => {

  // z.input   → mientras el usuario tipea (RHF, register, errors)
  //    ↓ (el resolver corre schema.parse() acá)
  // z.output/infer  → resultado validado que recibe el onSubmit/handleSubmit
  //    ↓ (se re-stringifica a mano para el FormData, por el multipart)
  // string otra vez → lo que efectivamente viaja por HTTP
  const { register, handleSubmit, formState: { errors } } = useForm<addProductFormInput, unknown, addProductCredentials>({
    resolver: zodResolver(addProductSchema)
  });

  const [image, setImage] = useState<File | null>(null);

  const { mutate: addProduct, isPending, error } = useAddProduct()

  const { data: categories, isPending: isCategoriesPending, isError: isCategoriesError } = useGetCategories()

  const categoryPlaceholder = isCategoriesPending
    ? "Cargando categorías..."
    : isCategoriesError || !categories?.length
      ? "No hay categorías creadas"
      : "Seleccioná una categoría";

  const onSubmit = (data: addProductCredentials) => {
    addProduct({ ...data, image }, { onSuccess: onClose });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-tertiary/70 px-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-product-title"
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-secondary p-8 shadow-[0_35px_90px_-15px] shadow-tertiary/55 ring-1 ring-tertiary/15 md:p-10 xl:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-tertiary/60 outline-none transition-colors duration-150 hover:bg-tertiary/5 hover:text-tertiary focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <i className="bi bi-x-lg text-lg" aria-hidden="true" />
        </button>

        <span
          id="add-product-title"
          className="text-xs font-bold text-primary xl:text-xl"
        >
          Agregar producto
        </span>
        <p className="mt-2 text-sm text-tertiary/60">
          Completá los datos para sumar un nuevo producto al catálogo.
        </p>

        <form
          className="mt-7 flex flex-col gap-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="name"
              className="text-left text-sm font-medium text-tertiary/60"
            >
              Nombre
            </label>
            <input
              id="name"
              type="text"
              placeholder="Escriba el nombre del producto..."
              className="h-11 w-full rounded-lg border border-tertiary/10 bg-tertiary/5 px-3.5 text-base text-tertiary placeholder:text-tertiary/50 transition-colors duration-150 outline-none focus-visible:border-primary focus-visible:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/20"
              {...register("name")}
            />
            {errors.name && (
              <span className="text-xs text-red-500">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="description"
              className="text-left text-sm font-medium text-tertiary/60"
            >
              Descripción
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Escriba una descripción del producto..."
              className="w-full resize-none rounded-lg border border-tertiary/10 bg-tertiary/5 px-3.5 py-2.5 text-base text-tertiary placeholder:text-tertiary/50 transition-colors duration-150 outline-none focus-visible:border-primary focus-visible:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/20"
              {...register("description")}
            />
            {errors.description && (
              <span className="text-xs text-red-500">
                {errors.description.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="price"
                className="text-left text-sm font-medium text-tertiary/60"
              >
                Precio
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="h-11 w-full rounded-lg border border-tertiary/10 bg-tertiary/5 px-3.5 text-base text-tertiary placeholder:text-tertiary/50 transition-colors duration-150 outline-none focus-visible:border-primary focus-visible:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/20"
                {...register("price")}
              />
              {errors.price && (
                <span className="text-xs text-red-500">
                  {errors.price.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="stock"
                className="text-left text-sm font-medium text-tertiary/60"
              >
                Stock
              </label>
              <input
                id="stock"
                type="number"
                min="0"
                placeholder="0"
                className="h-11 w-full rounded-lg border border-tertiary/10 bg-tertiary/5 px-3.5 text-base text-tertiary placeholder:text-tertiary/50 transition-colors duration-150 outline-none focus-visible:border-primary focus-visible:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/20"
                {...register("stock")}
              />
              {errors.stock && (
                <span className="text-xs text-red-500">
                  {errors.stock.message}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="categoryId"
                className="text-left text-sm font-medium text-tertiary/60"
              >
                Categoría
              </label>
              <select
                id="categoryId"
                defaultValue=""
                disabled={isCategoriesPending || isCategoriesError || !categories?.length}
                className="h-11 w-full rounded-lg border border-tertiary/10 bg-tertiary/5 px-3.5 text-base text-tertiary transition-colors duration-150 outline-none focus-visible:border-primary focus-visible:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                {...register("categoryId")}
              >
                <option value="" disabled>
                  {categoryPlaceholder}
                </option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <span className="text-xs text-red-500">
                  {errors.categoryId.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="image"
                className="text-left text-sm font-medium text-tertiary/60"
              >
                Imagen
              </label>
              <input
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="flex h-11 w-full items-center rounded-lg border border-tertiary/10 bg-tertiary/5 px-3 text-sm text-tertiary/60 transition-colors duration-150 outline-none file:mr-3 file:h-7 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:text-xs file:font-semibold file:text-secondary file:transition-colors file:duration-150 hover:file:bg-tertiary focus-visible:border-primary focus-visible:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/20"
                onChange={(event) => setImage(event.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error.message}</p>
          )}

          <div className="mt-2 flex flex-col-reverse gap-3 md:flex-row md:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-tertiary/15 px-6 text-base font-semibold text-tertiary/60 outline-none transition-colors duration-150 hover:border-tertiary/25 hover:text-tertiary focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-tertiary px-6 text-base font-semibold text-secondary shadow-[0_18px_35px_-8px] shadow-tertiary/60 outline-none transition-colors duration-150 hover:bg-primary focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
            >
              {isPending ? (
                <Loader inline />
              ) : (
                <>
                  Guardar producto
                  <i className="bi bi-check-lg text-lg" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputProductModal;
