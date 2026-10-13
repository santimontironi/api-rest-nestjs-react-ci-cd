import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addSaleSchema, type AddSaleInput, type AddSaleFormInput } from "../../../../shared/schemas/sale.schema";
import { useAddSale } from "../../hooks/salesHooks/useAddSale";
import { useGetProducts } from "../../hooks/productsHooks/useGetProducts";
import { useGetCustomers } from "../../hooks/customersHooks/useGetCustomers";
import { PAYMENT_METHOD_LABELS } from "../../utils/consts/sales.consts";
import Loader from "../ui/Loader";

const inputClassName =
  "h-11 w-full rounded-lg border border-tertiary/10 bg-tertiary/5 px-3.5 text-base text-tertiary placeholder:text-tertiary/50 transition-colors duration-150 outline-none focus-visible:border-primary focus-visible:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60";

const InputSaleModal = ({ onClose }: { onClose: () => void }) => {
  const { register, control, handleSubmit, formState: { errors } } = useForm<AddSaleFormInput, unknown, AddSaleInput>({
    resolver: zodResolver(addSaleSchema),
    defaultValues: { items: [{ productId: "", quantity: 1 }], paymentMethod: "CASH" },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = useWatch({ control, name: "items" });

  const { mutate: addSale, isPending, error } = useAddSale();
  const { data: products, isPending: isProductsPending } = useGetProducts();
  const { data: customers, isPending: isCustomersPending } = useGetCustomers();

  const total = items.reduce((sum, item) => {
    const product = products?.find((p) => p.id === item.productId);
    return product ? sum + product.price * (Number(item.quantity) || 0) : sum;
  }, 0);

  const onSubmit = (data: AddSaleInput) => {
    addSale(data, { onSuccess: onClose });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/70 px-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-sale-title"
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-secondary p-8 shadow-[0_35px_90px_-15px] shadow-tertiary/55 ring-1 ring-tertiary/15 md:p-10 xl:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-tertiary/60 outline-none transition-colors duration-150 hover:bg-tertiary/5 hover:text-tertiary focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <i className="bi bi-x-lg text-lg" aria-hidden="true" />
        </button>

        <span id="add-sale-title" className="text-xs font-bold text-primary xl:text-xl">
          Registrar venta
        </span>
        <p className="mt-2 text-sm text-tertiary/60">
          Elegí los productos vendidos. El stock se descuenta al guardar.
        </p>

        <form className="mt-7 flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-3">
            <span className="text-left text-sm font-medium text-tertiary/60">Productos</span>

            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col gap-1.5">
                <div className="flex items-start gap-3">
                  <select
                    aria-label={`Producto ${index + 1}`}
                    disabled={isProductsPending || !products?.length}
                    className={`${inputClassName} flex-1`}
                    {...register(`items.${index}.productId`)}
                  >
                    <option value="" disabled>
                      {isProductsPending ? "Cargando productos..." : "Seleccioná un producto"}
                    </option>
                    {products?.map((product) => (
                      <option key={product.id} value={product.id} disabled={product.stock === 0}>
                        {product.name} — ${product.price.toFixed(2)} (stock: {product.stock})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    aria-label={`Cantidad del producto ${index + 1}`}
                    className={`${inputClassName} w-24`}
                    {...register(`items.${index}.quantity`)}
                  />

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    aria-label={`Quitar producto ${index + 1}`}
                    className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-tertiary/50 outline-none transition-colors duration-150 hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <i className="bi bi-trash3 text-base" aria-hidden="true" />
                  </button>
                </div>
                {errors.items?.[index]?.productId && (
                  <span className="text-xs text-red-500">{errors.items[index].productId.message}</span>
                )}
                {errors.items?.[index]?.quantity && (
                  <span className="text-xs text-red-500">{errors.items[index].quantity.message}</span>
                )}
              </div>
            ))}

            {errors.items?.root && (
              <span className="text-xs text-red-500">{errors.items.root.message}</span>
            )}

            <button
              type="button"
              onClick={() => append({ productId: "", quantity: 1 })}
              className="flex h-10 w-fit cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-semibold text-primary outline-none transition-colors duration-150 hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <i className="bi bi-plus-lg" aria-hidden="true" />
              Agregar otro producto
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="paymentMethod" className="text-left text-sm font-medium text-tertiary/60">
                Método de pago
              </label>
              <select id="paymentMethod" className={inputClassName} {...register("paymentMethod")}>
                <option value="CASH">{PAYMENT_METHOD_LABELS.CASH}</option>
                <option value="TRANSFER">{PAYMENT_METHOD_LABELS.TRANSFER}</option>
              </select>
              {errors.paymentMethod && (
                <span className="text-xs text-red-500">{errors.paymentMethod.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="customerId" className="text-left text-sm font-medium text-tertiary/60">
                Cliente (opcional)
              </label>
              <select
                id="customerId"
                disabled={isCustomersPending}
                className={inputClassName}
                {...register("customerId", { setValueAs: (value) => value || undefined })}
              >
                <option value="">Sin cliente</option>
                {customers?.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} {customer.surname}
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <span className="text-xs text-red-500">{errors.customerId.message}</span>
              )}
            </div>
          </div>

          <div className="flex items-baseline justify-between border-t border-tertiary/10 pt-5">
            <span className="text-sm font-medium text-tertiary/60">Total</span>
            <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
          </div>

          {error && <p className="text-sm text-red-500">{error.message}</p>}

          <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-tertiary/15 px-6 text-base font-semibold text-tertiary/60 outline-none transition-colors duration-150 hover:border-tertiary/25 hover:text-tertiary focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-tertiary px-6 text-base font-semibold text-secondary shadow-[0_18px_35px_-8px] shadow-tertiary/60 outline-none transition-colors duration-150 hover:bg-linear-to-r hover:from-primary hover:to-primary-end focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
            >
              {isPending ? (
                <Loader inline />
              ) : (
                <>
                  Guardar venta
                  <i className="bi bi-check-lg text-lg" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputSaleModal;
