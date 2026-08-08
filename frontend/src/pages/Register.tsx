import { Link } from "react-router-dom"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {registerSchema} from "../../../shared/schemas/auth.schema"
import {useRegister} from "../hooks/useRegister"
import type { RegisterCredentials } from "../types/auth.types"

const Register = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<RegisterCredentials>({
    resolver: zodResolver(registerSchema)
  })

  const { mutate: registerUser, isPending, error, isSuccess } = useRegister()

  const submitForm = (data: RegisterCredentials) => {
    registerUser(data)
    reset()
  }

  return (
    <div className="min-h-screen bg-secondary md:grid md:grid-cols-2">
      <aside className="relative z-10 flex flex-col items-center justify-center gap-10 overflow-hidden bg-tertiary px-6 py-16 text-justify shadow-[0_24px_48px_-12px] shadow-tertiary/30 md:gap-14 md:px-10 md:py-20 md:shadow-[24px_0_48px_-12px] xl:px-16 2xl:px-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -left-16 h-32 w-32 rounded-full border-4 border-primary md:-top-28 md:-left-28 md:h-56 md:w-56 xl:-top-36 xl:-left-36 xl:h-72 xl:w-72 2xl:-top-48 2xl:-left-48 2xl:h-96 2xl:w-96"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -bottom-16 h-32 w-32 rounded-full border-4 border-primary md:-right-28 md:-bottom-28 md:h-56 md:w-56 xl:-right-36 xl:-bottom-36 xl:h-72 xl:w-72 2xl:-right-48 2xl:-bottom-48 2xl:h-96 2xl:w-96"
        />

        <div className="relative flex flex-col items-center gap-8 md:gap-10">
          <h1 className="max-w-md border-b-4 border-primary pb-8 text-center text-4xl leading-tight font-semibold text-secondary md:max-w-lg md:pb-10 md:text-5xl xl:max-w-2xl xl:text-6xl 2xl:max-w-3xl 2xl:text-7xl">
            El catálogo del equipo, en un solo lugar.
          </h1>
          <p className="max-w-sm text-base text-secondary/50 md:max-w-md md:text-lg xl:max-w-lg">
            Un solo catálogo de productos para todo el equipo: lo que carga uno,
            lo ven todos. Te enviamos un mail para confirmar la cuenta.
          </p>
        </div>
      </aside>

      <main className="flex items-center justify-center bg-tertiary/5 px-6 py-16 md:px-10 md:py-20 xl:px-16 2xl:px-24">
        <div className="w-full max-w-md rounded-2xl border border-tertiary/10 bg-secondary p-6 shadow-2xl shadow-tertiary/15 md:p-10 xl:max-w-xl xl:p-12 2xl:max-w-2xl 2xl:p-14">
          <h2 className="text-center text-2xl font-semibold text-tertiary md:text-3xl">
            Creá tu cuenta
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-center text-sm text-tertiary/60">
            Todos los campos son obligatorios.
          </p>

          {isSuccess && (
            <p className="mt-4 rounded-lg bg-tertiary/10 px-3.5 py-2.5 text-center text-sm text-tertiary">
              Cuenta creada. Revisá tu email para confirmarla.
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-primary/10 px-3.5 py-2.5 text-center text-sm text-primary">
              {error.message}
            </p>
          )}

          <form className="mt-8 flex flex-col gap-5 md:mt-10 xl:gap-6" onSubmit={handleSubmit(submitForm)}>
            <div className="grid gap-5 md:grid-cols-2 xl:gap-6">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="name"
                  className="text-left text-sm font-medium text-tertiary/60"
                >
                  Nombre
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Escriba su nombre..."
                  {...register("name")}
                  className="h-11 w-full rounded-lg border border-tertiary/10 bg-tertiary/5 px-3.5 text-base text-tertiary placeholder:text-tertiary/50 transition-colors duration-150 outline-none focus-visible:border-primary focus-visible:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/20"
                />
                {errors.name && (
                  <p className="text-left text-sm text-primary">{errors.name.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="surname"
                  className="text-left text-sm font-medium text-tertiary/60"
                >
                  Apellido
                </label>
                <input
                  id="surname"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Escriba su apellido..."
                  {...register("surname")}
                  className="h-11 w-full rounded-lg border border-tertiary/10 bg-tertiary/5 px-3.5 text-base text-tertiary placeholder:text-tertiary/50 transition-colors duration-150 outline-none focus-visible:border-primary focus-visible:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/20"
                />
                {errors.surname && (
                  <p className="text-left text-sm text-primary">{errors.surname.message}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-left text-sm font-medium text-tertiary/60"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Escriba su email..."
                {...register("email")}
                className="h-11 w-full rounded-lg border border-tertiary/10 bg-tertiary/5 px-3.5 text-base text-tertiary placeholder:text-tertiary/50 transition-colors duration-150 outline-none focus-visible:border-primary focus-visible:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/20"
              />
              {errors.email && (
                <p className="text-left text-sm text-primary">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-left text-sm font-medium text-tertiary/60"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Escriba su contraseña..."
                {...register("password")}
                className="h-11 w-full rounded-lg border border-tertiary/10 bg-tertiary/5 px-3.5 text-base text-tertiary placeholder:text-tertiary/50 transition-colors duration-150 outline-none focus-visible:border-primary focus-visible:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/20"
              />
              {errors.password && (
                <p className="text-left text-sm text-primary">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-3 flex h-11 cursor-pointer w-full items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-secondary transition-colors duration-150 outline-none hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary disabled:cursor-not-allowed disabled:opacity-50 md:h-12"
            >
              {isPending ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-tertiary/60">
            ¿Ya tenés cuenta?{" "}
            <Link
              to="/"
              className="rounded-sm cursor-pointer font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default Register
