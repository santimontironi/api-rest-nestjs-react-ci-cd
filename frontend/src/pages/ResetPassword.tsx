import { Link, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resetPasswordSchema, type ResetPasswordInput } from "../../../shared/schemas/auth.schema"
import { useResetPassword } from "../hooks/authHooks/useResetPassword"
import Loader from "../components/ui/Loader"

const ResetPassword = () => {

  const { token } = useParams()
  const { mutate, isPending, isError, isSuccess } = useResetPassword()

  const invalidToken = !token

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema)
  })

  const onSubmit = (data: ResetPasswordInput) => {
    if (!token) return
    mutate({ ...data, token })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-secondary px-6 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -left-16 h-32 w-32 rounded-full border-4 border-primary/25 md:-top-20 md:-left-20 md:h-40 md:w-40 xl:-top-24 xl:-left-24 xl:h-56 xl:w-56"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -bottom-16 h-32 w-32 rounded-full border-4 border-primary/25 md:-right-20 md:-bottom-20 md:h-40 md:w-40 xl:-right-24 xl:-bottom-24 xl:h-56 xl:w-56"
      />

      <div className="relative w-full max-w-lg rounded-2xl bg-secondary p-8 shadow-[0_35px_90px_-15px] shadow-tertiary/55 ring-1 ring-tertiary/15 md:p-10 xl:p-12">
        <div className="mb-6 flex w-fit">
          <img
            src="/images/logo.png"
            alt="Logo"
            className="h-14 w-14 rounded-lg object-contain md:h-17 md:w-17 xl:h-20 xl:w-20"
          />
        </div>

        <span className="text-xs font-bold text-primary xl:text-xl">
          Nueva contraseña
        </span>
        <p className="mt-2 text-sm text-tertiary/60">
          Elegí una nueva contraseña para tu cuenta.
        </p>

        {invalidToken ? (
          <div className="mt-7 flex flex-col gap-6">
            <p className="text-sm text-red-500">
              El enlace no es válido. Pedí uno nuevo desde "¿Olvidaste tu contraseña?".
            </p>
            <Link
              to="/"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-tertiary px-6 text-base font-semibold text-secondary shadow-[0_18px_35px_-8px] shadow-tertiary/60 outline-none transition-colors duration-150 hover:bg-primary focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
            >
              Volver al inicio
              <i className="bi bi-arrow-left text-lg" aria-hidden="true" />
            </Link>
          </div>
        ) : isSuccess ? (
          <div className="mt-7 flex flex-col gap-6">
            <p className="text-sm text-tertiary">
              Tu contraseña se actualizó correctamente.
            </p>
            <Link
              to="/"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-tertiary px-6 text-base font-semibold text-secondary shadow-[0_18px_35px_-8px] shadow-tertiary/60 outline-none transition-colors duration-150 hover:bg-primary focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
            >
              Iniciar sesión
              <i className="bi bi-arrow-right text-lg" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <form className="mt-7 flex flex-col gap-6 md:mt-10" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="newPassword"
                className="text-left text-sm font-medium text-tertiary/60"
              >
                Contraseña
              </label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Escriba su nueva contraseña..."
                className="h-11 w-full rounded-lg border border-tertiary/10 bg-tertiary/5 px-3.5 text-base text-tertiary placeholder:text-tertiary/50 transition-colors duration-150 outline-none focus-visible:border-primary focus-visible:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/20"
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <span className="text-xs text-red-500">{errors.newPassword.message}</span>
              )}
            </div>

            {isError && (
              <p className="text-sm text-red-500">El enlace es inválido o expiró. Pedí uno nuevo.</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-tertiary px-6 text-base font-semibold text-secondary shadow-[0_18px_35px_-8px] shadow-tertiary/60 outline-none transition-colors duration-150 hover:bg-primary focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <Loader inline />
              ) : (
                <>
                  Guardar contraseña
                  <i className="bi bi-check2 text-lg" aria-hidden="true" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPassword
