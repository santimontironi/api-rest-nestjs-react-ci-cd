import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../../shared/schemas/auth.schema";
import type { LoginCredentials } from "../types/auth.types";
import { useLogin } from "../hooks/useLogin";
import { useMe } from "../hooks/useMe";
import InputMailModal from "../components/InputMailModal";
import Loader from "../components/Loader";

const Login = () => {
  const { data: user } = useMe();
  const { mutate, isPending, isError, error } = useLogin();

  const navigate = useNavigate();

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginCredentials) => {
    mutate(data);
    reset();
  };

  useEffect(() => {
    if (user) {
      navigate("/inicio", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-secondary">
      <div className="relative flex min-h-screen flex-col md:flex-row">
        <div className="relative flex min-h-[52vh] flex-col justify-center gap-8 bg-primary px-6 shadow-[10px_10px_15px_4px] shadow-tertiary/60 md:min-h-[60vh] md:gap-10 md:px-10 xl:min-h-screen md:w-[47%] xl:w-[53%] xl:px-16 xl:shadow-[14px_0_30px_-6px] 2xl:px-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -left-16 h-32 w-32 rounded-full border-4 border-tertiary/25 md:-top-20 md:-left-20 md:h-40 md:w-40 xl:-top-24 xl:-left-24 xl:h-56 xl:w-56 2xl:-top-28 2xl:-left-28 2xl:h-64 2xl:w-64"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none hidden absolute rounded-full border-4 border-tertiary/25 xl:block xl:bottom-0 xl:-left-24 xl:h-56 xl:w-56 2xl:bottom-0 2xl:-left-28 2xl:h-64 2xl:w-64"
          />

          <div>
            <div className="mb-6 flex w-fit">
              <img
                src="/images/logo.png"
                alt="Logo"
                className="h-14 w-14 rounded-lg object-contain md:h-17 md:w-17 xl:h-20 xl:w-20"
              />
            </div>

            <span className="text-xs font-bold tracking-[0.3em] text-secondary/70 uppercase md:text-sm xl:text-md">
              Accedé a tu cuenta
            </span>
            <h1 className="mt-3 max-w-lg text-5xl leading-[1.02] font-bold tracking-tight text-secondary [text-shadow:0_6px_28px_rgba(0,8,18,0.4)] md:max-w-lg md:text-6xl xl:max-w-2xl xl:text-7xl 2xl:max-w-4xl 2xl:text-8xl">
              Bienvenido a Catálogo.
            </h1>
            <p className="mt-5 max-w-xs text-base text-secondary/85 [text-shadow:0_2px_12px_rgba(0,8,18,0.3)] md:mt-6 md:max-w-sm md:text-lg xl:max-w-lg 2xl:max-w-xl">
              Ingresá con tus credenciales a Catálogo y empezá a gestionar tus
              productos.
            </p>
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center px-6 pb-12 md:px-10 md:pb-16 xl:w-[47%] xl:flex-none xl:justify-start xl:px-0 xl:pb-0 2xl:justify-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -bottom-16 h-32 w-32 rounded-full border-4 border-primary/25 md:-right-20 md:-bottom-20 md:h-40 md:w-40 xl:-right-24 xl:-bottom-24 xl:h-56 xl:w-56 2xl:-right-28 2xl:-bottom-28 2xl:h-64 2xl:w-64"
          />

          <div className="relative w-full max-w-lg rounded-2xl mt-10 bg-secondary p-8 shadow-[0_35px_90px_-15px] shadow-tertiary/55 ring-1 ring-tertiary/15 md:p-10 md:ml-10 xl:mr-20 xl:p-12 2xl:mr-24">
            <span className="text-xs xl:text-xl font-bold text-primary">
              Iniciar sesión
            </span>
            <p className="mt-2 text-sm text-tertiary/60">
              Ingresá tus credenciales para continuar.
            </p>

            <form
              className="mt-7 flex flex-col gap-6 md:mt-10 md:mb-10"
              onSubmit={handleSubmit(onSubmit)}
            >
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
                  className="h-11 w-full rounded-lg border border-tertiary/10 bg-tertiary/5 px-3.5 text-base text-tertiary placeholder:text-tertiary/50 transition-colors duration-150 outline-none focus-visible:border-primary focus-visible:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/20"
                  {...register("email")}
                />
                {errors.email && (
                  <span className="text-xs text-red-500">
                    {errors.email.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="password"
                    className="text-left text-sm font-medium text-tertiary/60"
                  >
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="cursor-pointer text-sm font-medium text-primary transition-colors duration-150 hover:text-tertiary"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Escriba su contraseña..."
                  className="h-11 w-full rounded-lg border border-tertiary/10 bg-tertiary/5 px-3.5 text-base text-tertiary placeholder:text-tertiary/50 transition-colors duration-150 outline-none focus-visible:border-primary focus-visible:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/20"
                  {...register("password")}
                />
                {errors.password && (
                  <span className="text-xs text-red-500">
                    {errors.password.message}
                  </span>
                )}
              </div>

              {isError && (
                <p className="text-sm text-red-500">{error.message}</p>
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
                    Iniciar sesión
                    <i
                      className="bi bi-arrow-right text-lg"
                      aria-hidden="true"
                    />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {showForgotPassword && (
        <InputMailModal onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
};

export default Login;
