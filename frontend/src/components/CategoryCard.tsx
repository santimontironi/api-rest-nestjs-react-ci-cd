import type { Category } from "../../../shared/schemas/category.schema";

const CategoryCard = ({ category }: { category: Category }) => {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-tertiary/10 border-l-4 border-l-primary bg-secondary p-5 shadow-[0_10px_30px_-15px] shadow-tertiary/30">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-secondary">
        <i className="bi bi-tag text-xl" aria-hidden="true" />
      </div>
      <p className="text-base font-semibold text-tertiary">{category.name}</p>
    </div>
  );
};

export default CategoryCard;
