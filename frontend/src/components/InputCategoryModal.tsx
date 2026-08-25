import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addCategorySchema, type AddCategoryInput } from "../../../shared/schemas/category.schema";
import { useAddCategory } from "../hooks/useAddCategory";
import Loader from "./Loader";

const InputCategoryModal = ({ onClose }: { onClose: () => void }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<AddCategoryInput>({
    resolver: zodResolver(addCategorySchema),
  });

  const { mutate: addCategory, isPending, error } = useAddCategory();

  const onSubmit = (data: AddCategoryInput) => {
    addCategory(data, { onSuccess: onClose });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-tertiary/70 px-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-category-title"
        className="relative w-full max-w-md rounded-2xl bg-secondary p-8 shadow-[0_35px_90px_-15px] shadow-tertiary/55 ring-1 ring-tertiary/15 md:p-10"
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
          id="add-category-title"
          className="text-xs font-bold text-primary xl:text-xl"
        >
          Agregar categoría
        </span>
        <p className="mt-2 text-sm text-tertiary/60">
          Ingresá el nombre de la nueva categoría.
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
              placeholder="Escriba el nombre de la categoría..."
              className="h-11 w-full rounded-lg border border-tertiary/10 bg-tertiary/5 px-3.5 text-base text-tertiary placeholder:text-tertiary/50 transition-colors duration-150 outline-none focus-visible:border-primary focus-visible:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/20"
              {...register("name")}
            />
            {errors.name && (
              <span className="text-xs text-red-500">{errors.name.message}</span>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500">{error.message}</p>
          )}

          <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
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
                  Guardar categoría
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

export default InputCategoryModal;
