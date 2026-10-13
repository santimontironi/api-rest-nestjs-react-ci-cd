import type { Sale } from "../../../../shared/schemas/sale.schema";
import { PAYMENT_METHOD_LABELS } from "../../utils/consts/sales.consts";

const SalesTable = ({ sales }: { sales: Sale[] }) => {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:hidden">
        {sales.map((sale) => (
          <div
            key={sale.id}
            className="flex flex-col gap-3 rounded-2xl border border-tertiary/10 bg-secondary p-5 shadow-[0_10px_30px_-15px] shadow-tertiary/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-sm text-tertiary/60">{sale.createdAt.toLocaleString("es-AR")}</p>
                <p className="text-base font-semibold text-tertiary">
                  {sale.customerName ? `${sale.customerName} ${sale.customerSurname}` : "Sin cliente"}
                </p>
              </div>
              <span className="text-xl font-bold text-primary">${sale.total.toFixed(2)}</span>
            </div>

            <ul className="flex flex-col gap-1 text-sm text-tertiary/80">
              {sale.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span>{item.quantity} × {item.productName}</span>
                  <span className="text-tertiary/60">${(item.quantity * item.unitPrice).toFixed(2)}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-1.5 border-t border-tertiary/10 pt-3 text-xs text-tertiary/60">
              <i className={`bi ${sale.paymentMethod === "CASH" ? "bi-cash" : "bi-bank"}`} aria-hidden="true" />
              {PAYMENT_METHOD_LABELS[sale.paymentMethod]}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-tertiary/10 bg-secondary shadow-[0_10px_30px_-15px] shadow-tertiary/30 xl:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 border-collapse text-left">
            <thead>
              <tr className="border-b border-tertiary/10 bg-tertiary/5">
                <th scope="col" className="px-4 py-3 text-xs font-semibold text-primary md:px-6">
                  Fecha
                </th>
                <th scope="col" className="px-4 py-3 text-xs font-semibold text-primary md:px-6">
                  Cliente
                </th>
                <th scope="col" className="px-4 py-3 text-xs font-semibold text-primary md:px-6">
                  Productos
                </th>
                <th scope="col" className="px-4 py-3 text-xs font-semibold text-primary md:px-6">
                  Pago
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-primary md:px-6">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tertiary/10">
              {sales.map((sale) => (
                <tr key={`row-${sale.id}`} className="align-top transition-colors duration-150 hover:bg-tertiary/5">
                  <td className="px-4 py-3 text-sm text-tertiary/60 md:px-6">
                    {sale.createdAt.toLocaleString("es-AR")}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-tertiary md:px-6">
                    {sale.customerName ? `${sale.customerName} ${sale.customerSurname}` : (
                      <span className="font-normal text-tertiary/40">Sin cliente</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-tertiary/80 md:px-6">
                    <ul className="flex flex-col gap-0.5">
                      {sale.items.map((item) => (
                        <li key={item.id}>
                          {item.quantity} × {item.productName}
                          <span className="text-tertiary/50"> (${item.unitPrice.toFixed(2)} c/u)</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 text-sm text-tertiary/60 md:px-6">
                    {PAYMENT_METHOD_LABELS[sale.paymentMethod]}
                  </td>
                  <td className="px-4 py-3 text-right text-base font-bold text-primary md:px-6">
                    ${sale.total.toFixed(2)}
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

export default SalesTable;
