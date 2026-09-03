import swal from "../../utils/swal";
import type { Product } from "../../../../shared/schemas/product.schema";
import { useDeleteProduct } from "../../hooks/productsHooks/useDeleteProduct";

const ProductsTable = ({ products, onProductClick, onEditClick }: { products: Product[]; onProductClick?: (product: Product) => void; onEditClick?: (product: Product) => void; }) => {
  const { mutate: deleteProduct } = useDeleteProduct();

  const handleDelete = (product: Product) => {
    swal.fire({
      title: "¿Eliminar producto?",
      text: `Se eliminará "${product.name}" del catálogo. Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (!result.isConfirmed) return;

      deleteProduct(product.id, {
        onSuccess: () =>
          swal.fire({
            title: "Producto eliminado",
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
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => onProductClick?.(product)}
            className="flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-tertiary/10 bg-secondary shadow-[0_10px_30px_-15px] shadow-tertiary/30"
          >
            <div className="relative aspect-4/3 w-full bg-tertiary/5">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-tertiary/20">
                  <i className="bi bi-image text-5xl" aria-hidden="true" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEditClick?.(product);
                  }}
                  aria-label={`Editar ${product.name}`}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-tertiary/60 text-secondary outline-none backdrop-blur-sm transition-colors duration-150 hover:bg-primary focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <i className="bi bi-pencil text-sm" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDelete(product);
                  }}
                  aria-label={`Eliminar ${product.name}`}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-tertiary/60 text-secondary outline-none backdrop-blur-sm transition-colors duration-150 hover:bg-primary focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <i className="bi bi-trash3 text-sm" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex flex-col gap-1">
                <p className="text-base font-semibold text-tertiary">{product.name}</p>
                <p className="line-clamp-2 text-sm text-tertiary/60">{product.description}</p>
              </div>

              <div className="mt-auto flex flex-col gap-2 border-t border-tertiary/10 pt-3">
                <span className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</span>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-tertiary/60">
                  <span className="flex items-center gap-1.5">
                    <i className="bi bi-box-seam" aria-hidden="true" />
                    Stock: {product.stock}
                  </span>
                  <span className="flex items-center gap-1.5 truncate">
                    <i className="bi bi-tag" aria-hidden="true" />
                    {product.category.name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="bi bi-calendar3" aria-hidden="true" />
                    {product.createdAt.toLocaleDateString("es-AR")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-tertiary/10 bg-secondary shadow-[0_10px_30px_-15px] shadow-tertiary/30 xl:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-tertiary/10 bg-tertiary/5">
                <th scope="col" className="w-[6%] px-4 py-3 md:px-6">
                  <span className="sr-only">Imagen</span>
                </th>
                <th
                  scope="col"
                  className="w-[26%] px-4 py-3 text-xs font-semibold text-primary md:px-6"
                >
                  Producto
                </th>
                <th
                  scope="col"
                  className="w-[14%] px-4 py-3 text-xs font-semibold text-primary md:px-6"
                >
                  Categoría
                </th>
                <th
                  scope="col"
                  className="w-[10%] px-4 py-3 text-xs font-semibold text-primary md:px-6"
                >
                  Stock
                </th>
                <th
                  scope="col"
                  className="w-[14%] px-4 py-3 text-xs font-semibold text-primary md:px-6"
                >
                  Creado
                </th>
                <th
                  scope="col"
                  className="w-[14%] px-4 py-3 text-right text-xs font-semibold text-primary md:px-6"
                >
                  Precio
                </th>
                <th
                  scope="col"
                  className="w-[16%] px-4 py-3 text-right text-xs font-semibold text-primary md:px-6"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tertiary/10">
              {products.map((product) => (
                <tr
                  key={`row-${product.id}`}
                  onClick={() => onProductClick?.(product)}
                  className="group cursor-pointer transition-colors duration-150 hover:bg-primary"
                >
                  <td className="px-4 py-3 md:px-6">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-tertiary/5 transition-colors duration-150 group-hover:bg-secondary/10 md:h-12 md:w-12">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-tertiary/20 transition-colors duration-150 group-hover:text-secondary/50">
                          <i className="bi bi-image text-lg" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 md:px-6">
                    <div className="flex w-full flex-col gap-0.5">
                      <p className="truncate text-sm font-semibold text-tertiary transition-colors duration-150 group-hover:text-secondary md:text-base">
                        {product.name}
                      </p>
                      <p className="truncate text-xs text-tertiary/60 transition-colors duration-150 group-hover:text-secondary/70">
                        {product.description}
                      </p>
                    </div>
                  </td>
                  <td className="truncate px-4 py-3 text-sm text-tertiary/60 transition-colors duration-150 group-hover:text-secondary/70 md:px-6">
                    {product.category.name}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-tertiary transition-colors duration-150 group-hover:text-secondary md:px-6">
                    {product.stock}
                  </td>
                  <td className="px-4 py-3 text-sm text-tertiary/60 transition-colors duration-150 group-hover:text-secondary/70 md:px-6">
                    {product.createdAt.toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-primary transition-colors duration-150 group-hover:text-secondary md:px-6 md:text-base">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 md:px-6">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEditClick?.(product);
                        }}
                        aria-label={`Editar ${product.name}`}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-tertiary/50 outline-none transition-colors duration-150 group-hover:text-secondary hover:bg-secondary hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/50"
                      >
                        <i className="bi bi-pencil text-base" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDelete(product);
                        }}
                        aria-label={`Eliminar ${product.name}`}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-tertiary/50 outline-none transition-colors duration-150 group-hover:text-secondary hover:bg-secondary hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/50"
                      >
                        <i className="bi bi-trash3 text-base" aria-hidden="true" />
                      </button>
                    </div>
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

export default ProductsTable;
