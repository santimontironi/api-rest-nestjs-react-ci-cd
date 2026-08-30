import { useProductById } from "../../hooks/productsHooks/useProductById";
import Loader from "../ui/Loader";
import GoBack from "../ui/GoBack";

const ProductDetail = ({ productId, onBack }: { productId: string; onBack: () => void }) => {
  const { data: product, isPending, isError, error } = useProductById(productId);

  const backButton = <GoBack label="Volver a productos" onBack={onBack} />;

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

      <div className="flex flex-col gap-8 xl:grid xl:grid-cols-12 xl:items-start xl:gap-16">
        <div className="aspect-square w-full overflow-hidden rounded-2xl border border-tertiary/10 bg-tertiary/5 shadow-[0_10px_30px_-15px] shadow-tertiary/30 xl:col-span-5">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-tertiary/20">
              <i className="bi bi-image text-6xl" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-6 xl:col-span-7 xl:gap-8 xl:pt-2">
          <div className="flex flex-col gap-3">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <i className="bi bi-tag" aria-hidden="true" />
              {product.category.name}
            </span>
            <h1 className="text-3xl font-bold text-tertiary md:text-4xl xl:text-5xl">
              {product.name}
            </h1>
          </div>

          <p className="max-w-md text-base leading-relaxed wrap-break-words text-tertiary/70 md:text-lg">
            {product.description}
          </p>

          <div className="flex flex-col gap-1 border-t border-tertiary/10 pt-6">
            <span className="text-xs font-semibold text-tertiary/50">Precio</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-primary md:text-3xl">$</span>
              <span className="text-5xl font-black text-primary md:text-6xl xl:text-7xl">
                {product.price.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-tertiary/10 pt-6 text-sm text-tertiary/60">
            <span className="flex items-center gap-1.5">
              <i className="bi bi-box-seam" aria-hidden="true" />
              Stock: <span className="font-semibold text-tertiary">{product.stock}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <i className="bi bi-calendar3" aria-hidden="true" />
              Agregado el {product.createdAt.toLocaleDateString("es-AR")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
