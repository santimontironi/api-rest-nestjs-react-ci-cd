import { useState } from "react";
import swal from "../../utils/swal";
import { useCategoryById } from "../../hooks/categoriesHooks/useCategoryById";
import { useDeleteCategory } from "../../hooks/categoriesHooks/useDeleteCategory";
import ProductsTable from "../products/ProductsTable";
import ProductDetail from "../products/ProductDetail";
import Loader from "../ui/Loader";
import GoBack from "../ui/GoBack";
import type { CategoryWithProducts } from "../../../../shared/schemas/product.schema";

const CategoryDetail = ({ categoryId, onBack }: { categoryId: string; onBack: () => void }) => {
  const { data: category, isPending, isError, error } = useCategoryById(categoryId);
  const { mutate: deleteCategory } = useDeleteCategory();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const handleDelete = (category: CategoryWithProducts) => {
    const hasProducts = category.products.length > 0;

    swal.fire({
      title: "¿Eliminar categoría?",
      text: hasProducts
        ? `Se eliminará "${category.name}" junto con ${category.products.length} ${category.products.length === 1 ? "producto asociado" : "productos asociados"}. Esta acción no se puede deshacer.`
        : `Se eliminará "${category.name}". Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (!result.isConfirmed) return;

      deleteCategory(category.id, {
        onSuccess: () => {
          onBack();
          swal.fire({
            title: "Categoría eliminada",
            icon: "success",
            timer: 1800,
            showConfirmButton: false,
          });
        },
        onError: (error) =>
          swal.fire({
            title: "No se pudo eliminar",
            text: error.message,
            icon: "error",
          }),
      });
    });
  };

  const backButton = <GoBack label="Volver" onBack={onBack} />;

  if (selectedProductId) {
    return (
      <ProductDetail
        productId={selectedProductId}
        onBack={() => setSelectedProductId(null)}
      />
    );
  }

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

      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="border-l-4 border-primary pl-4">
          <h1 className="text-2xl font-bold text-tertiary md:text-3xl xl:text-4xl">
            {category.name}
          </h1>
          <p className="mt-1 text-sm text-tertiary/60 md:text-base">
            {category.products.length}{" "}
            {category.products.length === 1 ? "producto" : "productos"} en esta categoría
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleDelete(category)}
          className="flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/30 px-5 text-sm font-semibold text-red-500 outline-none transition-colors duration-150 hover:bg-red-500 hover:text-secondary focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary md:text-base"
        >
          <i className="bi bi-trash3 text-base" aria-hidden="true" />
          Eliminar categoría
        </button>
      </div>

      {category.products.length > 0 ? (
        <ProductsTable
          products={category.products}
          onProductClick={(product) => setSelectedProductId(product.id)}
        />
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
