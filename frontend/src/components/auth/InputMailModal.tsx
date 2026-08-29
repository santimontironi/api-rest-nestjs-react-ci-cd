import { useForgotPassword } from "../../hooks/authHooks/useForgotPassword";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "../../../../shared/schemas/auth.schema";
import Loader from "../ui/Loader";

const InputMailModal = ({ onClose }: { onClose: () => void }) => {
  const { mutate, isPending, isError, isSuccess, error } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-tertiary/70 px-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-password-title"
        className="relative w-full max-w-md rounded-2xl bg-secondary p-8 shadow-[0_35px_90px_-15px] shadow-tertiary/55 ring-1 ring-tertiary/15 md:p-10"
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

        <span
          id="forgot-password-title"
          className="text-xs font-bold text-primary xl:text-xl"
        >
          Recuperar contraseña
        </span>
        <p className="mt-2 text-sm text-tertiary/60">
          Ingresá tu email y te enviamos un enlace para crear una nueva
          contraseña.
        </p>

        {isSuccess ? (
          <p className="mt-7 text-sm text-tertiary">
            Si el email está registrado, vas a recibir un enlace para
            restablecer tu contraseña.
          </p>
        ) : (
          <form
            className="mt-7 flex flex-col gap-6"
            onSubmit={handleSubmit((data) => mutate(data))}
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="forgot-email"
                className="text-left text-sm font-medium text-tertiary/60"
              >
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="Escriba su email..."
                className="h-11 w-full rounded-lg border border-tertiary/10 bg-tertiary/5 px-3.5 text-base text-tertiary placeholder:text-tertiary/50 transition-colors duration-150 outline-none focus-visible:border-primary focus-visible:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/20"
                {...register("email")}
              />
              {errors.email && (
                <span className="text-xs text-red-500">
                  {errors.email.message}
                </span>
              )}
            </div>

            {isError && <p className="text-sm text-red-500">{error.message}</p>}

            <button
              type="submit"
              disabled={isPending}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-tertiary px-6 text-base font-semibold text-secondary shadow-[0_18px_35px_-8px] shadow-tertiary/60 outline-none transition-colors duration-150 hover:bg-primary focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <Loader inline />
              ) : (
                <>
                  Enviar enlace
                  <i className="bi bi-envelope text-lg" aria-hidden="true" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default InputMailModal;
