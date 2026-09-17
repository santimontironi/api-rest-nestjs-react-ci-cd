import type { Category } from "../../../../shared/schemas/category.schema";

const CategoryCard = ({ category, onClick }: { category: Category; onClick?: () => void }) => {
  return (
    <div
      onClick={onClick}
      className="group relative mx-auto flex aspect-4/3 w-full max-w-80 cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border border-tertiary/10 bg-tertiary/5 p-6 shadow-[0_10px_30px_-15px] shadow-tertiary/40 transition-all duration-300 hover:-translate-y-3 hover:border-transparent hover:bg-linear-to-br hover:from-primary hover:to-primary-end hover:shadow-[0_20px_45px_-12px] hover:shadow-primary/50">
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/10 blur-2xl transition-opacity duration-300 group-hover:bg-secondary/20 group-hover:opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-tertiary/10 group-hover:bg-secondary/20" />

      <div className="relative flex h-22 w-22 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:border-secondary group-hover:bg-secondary group-hover:text-primary">
        <i className="bi bi-tag text-4xl" aria-hidden="true" />
      </div>

      <div className="relative flex flex-col items-center gap-2">
        <p className="line-clamp-2 text-center text-lg font-bold tracking-tight text-tertiary transition-colors duration-300 group-hover:text-secondary">
          {category.name}
        </p>
        <span className="h-0.5 w-6 rounded-full bg-primary/40 transition-all duration-300 group-hover:w-12 group-hover:bg-secondary" />
        {category._count && (
          <span className="text-xs text-tertiary/60 transition-colors duration-300 group-hover:text-secondary/80">
            {category._count.products}{" "}
            {category._count.products === 1 ? "producto" : "productos"}
          </span>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;
