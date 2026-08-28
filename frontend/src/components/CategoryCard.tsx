import type { Category } from "../../../shared/schemas/category.schema";

const CategoryCard = ({ category, onClick }: { category: Category; onClick?: () => void }) => {
  return (
    <div
      onClick={onClick}
      className="group relative mx-auto flex aspect-4/3 w-full max-w-80 cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl bg-primary p-6 shadow-[0_1px_2px_rgba(0,8,18,0.30),0_4px_8px_-2px_rgba(0,8,18,0.25),0_12px_20px_-6px_rgba(0,8,18,0.30),0_24px_40px_-12px_rgba(0,8,18,0.35)] ring-1 ring-inset ring-secondary/25 transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_2px_4px_rgba(0,8,18,0.30),0_8px_14px_-3px_rgba(0,8,18,0.28),0_20px_32px_-8px_rgba(0,8,18,0.34),0_40px_60px_-16px_rgba(0,8,18,0.45)] hover:ring-secondary/50">
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-secondary/10 blur-2xl transition-opacity duration-300 group-hover:opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-secondary/30" />

      <div className="relative flex h-22 w-22 shrink-0 items-center justify-center rounded-full border-2 border-secondary/40 bg-secondary/10 text-secondary transition-all duration-300 group-hover:scale-110 group-hover:border-secondary group-hover:bg-secondary group-hover:text-primary">
        <i className="bi bi-tag text-4xl" aria-hidden="true" />
      </div>

      <div className="relative flex flex-col items-center gap-2">
        <p className="line-clamp-2 text-center text-lg font-bold tracking-tight text-secondary">
          {category.name}
        </p>
        <span className="h-0.5 w-6 rounded-full bg-secondary/40 transition-all duration-300 group-hover:w-12 group-hover:bg-secondary" />
        {category._count && (
          <span className="text-xs text-secondary/70">
            {category._count.products}{" "}
            {category._count.products === 1 ? "producto" : "productos"}
          </span>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;
