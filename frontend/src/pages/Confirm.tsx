import { useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { useConfirm } from "../hooks/useConfirm"

const Confirm = () => {

    const { mutate, isPending, error, isSuccess } = useConfirm()

    const { token } = useParams()

    useEffect(() => {
        if (token) mutate(token)
    }, [token, mutate])

    return (
        <div className="flex min-h-screen items-center justify-center bg-tertiary px-6 py-16 md:px-10 md:py-20 xl:px-16 2xl:px-24">
            <div className="w-full max-w-md rounded-2xl border border-tertiary/10 bg-secondary p-8 text-center shadow-2xl shadow-tertiary/30 md:p-10 xl:max-w-lg xl:p-12">
                {isPending && (
                    <>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-tertiary/10 md:h-20 md:w-20">
                            <i className="bi bi-arrow-repeat animate-spin text-3xl text-tertiary md:text-4xl" aria-hidden="true" />
                        </div>
                        <h1 className="mt-6 text-xl font-semibold text-tertiary md:text-2xl">
                            Confirmando tu cuenta...
                        </h1>
                        <p className="mx-auto mt-2 max-w-xs text-sm text-tertiary/60">
                            Esperá un momento, estamos validando tu enlace.
                        </p>
                    </>
                )}

                {isSuccess && (
                    <>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-tertiary/10 md:h-20 md:w-20">
                            <i className="bi bi-check-circle text-3xl text-tertiary md:text-4xl" aria-hidden="true" />
                        </div>
                        <h1 className="mt-6 text-xl font-semibold text-tertiary md:text-2xl">
                            Cuenta confirmada
                        </h1>
                        <p className="mt-4 rounded-lg bg-tertiary/10 px-3.5 py-2.5 text-sm text-tertiary">
                            Tu cuenta ya está activa. Ahora podés iniciar sesión.
                        </p>
                        <Link
                            to="/"
                            className="mt-8 flex h-11 w-full cursor-pointer items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-secondary outline-none transition-colors duration-150 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary md:h-12"
                        >
                            Iniciar sesión
                        </Link>
                    </>
                )}

                {error && (
                    <>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 md:h-20 md:w-20">
                            <i className="bi bi-x-circle text-3xl text-primary md:text-4xl" aria-hidden="true" />
                        </div>
                        <h1 className="mt-6 text-xl font-semibold text-tertiary md:text-2xl">
                            No pudimos confirmar tu cuenta
                        </h1>
                        <p className="mt-4 rounded-lg bg-primary/10 px-3.5 py-2.5 text-sm text-primary">
                            {error.message}
                        </p>
                        <Link
                            to="/"
                            className="mt-8 flex h-11 w-full cursor-pointer items-center justify-center rounded-lg border border-primary px-6 text-base font-semibold text-primary outline-none transition-colors duration-150 hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary md:h-12"
                        >
                            Volver al login
                        </Link>
                    </>
                )}

                {!token && !isPending && !isSuccess && !error && (
                    <>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 md:h-20 md:w-20">
                            <i className="bi bi-x-circle text-3xl text-primary md:text-4xl" aria-hidden="true" />
                        </div>
                        <h1 className="mt-6 text-xl font-semibold text-tertiary md:text-2xl">
                            Enlace incompleto
                        </h1>
                        <p className="mx-auto mt-2 max-w-xs text-sm text-tertiary/60">
                            No encontramos un token de confirmación en este enlace.
                        </p>
                        <Link
                            to="/"
                            className="mt-8 flex h-11 w-full cursor-pointer items-center justify-center rounded-lg border border-primary px-6 text-base font-semibold text-primary outline-none transition-colors duration-150 hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary md:h-12"
                        >
                            Volver al login
                        </Link>
                    </>
                )}
            </div>
        </div>
    )
}

export default Confirm