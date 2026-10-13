import type { Product } from "../../../../shared/schemas/product.schema";
import { STOCK_LEVELS } from "../../utils/consts/products.consts";

const StockLevelDot = ({ level }: { level: Product["stockLevel"] }) => (
  <span
    role="img"
    aria-label={STOCK_LEVELS[level].label}
    title={STOCK_LEVELS[level].label}
    className={`inline-block size-2.5 shrink-0 rounded-full ${STOCK_LEVELS[level].color}`}
  />
);

export default StockLevelDot;
