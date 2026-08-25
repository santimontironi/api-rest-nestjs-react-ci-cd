import type { Product } from "../../../shared/schemas/product.schema";

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-tertiary/10 bg-secondary p-5 shadow-[0_10px_30px_-15px] shadow-tertiary/30">
      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          className="mb-2 h-36 w-full rounded-xl object-cover"
        />
      )}
      <p className="text-base font-semibold text-tertiary">{product.name}</p>
      <p className="line-clamp-2 text-sm text-tertiary/60">{product.description}</p>
      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-primary">${product.price.toFixed(2)}</span>
        <span className="text-tertiary/60">Stock: {product.stock}</span>
      </div>
    </div>
  );
};

export default ProductCard;
