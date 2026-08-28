import { useCategoryById } from "../hooks/useCategoryById";
import ProductsTable from "./ProductsTable";
import Loader from "./Loader";

const CategoryDetail = ({ categoryId, onBack }: { categoryId: string; onBack: () => void }) => {
  const { data: category, isPending, isError, error } = useCategoryById(categoryId);

  const backButton = (
    <button
      type="button"
      onClick={onBack}
      className="flex w-fit cursor-pointer items-center gap-2 text-sm font-semibold text-tertiary/60 outline-none transition-colors duration-150 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <i className="bi bi-arrow-left text-base" aria-hidden="true" />
      Volver a categorías
    </button>
  );

  if (isPending) {
    return (
      <div className="flex flex-col gap-8 xl:gap-10">
        {backButton}
        <div className="flex justify-center py-16">
          <Loader inline />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-8 xl:gap-10">
        {backButton}
        <div className="rounded-2xl border border-dashed border-tertiary/15 bg-tertiary/5 px-6 py-16 text-center">
          <p className="text-sm text-red-500">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 xl:gap-10">
      {backButton}

      <div className="border-l-4 border-primary pl-4">
        <h1 className="text-2xl font-bold text-tertiary md:text-3xl xl:text-4xl">
          {category.name}
        </h1>
        <p className="mt-1 text-sm text-tertiary/60 md:text-base">
          {category.products.length}{" "}
          {category.products.length === 1 ? "producto" : "productos"} en esta categoría
        </p>
      </div>

      {category.products.length > 0 ? (
        <ProductsTable products={category.products} />
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-tertiary/15 bg-tertiary/5 px-6 py-16 text-center md:py-24">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <i className="bi bi-box-seam text-2xl" aria-hidden="true" />
          </div>
          <p className="text-base font-semibold text-tertiary">
            Todavía no hay productos en esta categoría
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryDetail;
