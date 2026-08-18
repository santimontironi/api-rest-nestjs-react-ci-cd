import type { sidebarItems } from "../types/general.types";
import { useMe } from "../hooks/useMe";
import { useLogout } from "../hooks/useLogout";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
    activeItem: sidebarItems;
    setActiveItem: (item: sidebarItems) => void;
}

const menuItems: { key: sidebarItems; label: string; icon: string }[] = [
    { key: "dashboard", label: "Tablero", icon: "bi-grid-1x2" },
    { key: "products", label: "Productos", icon: "bi-box-seam" },
    { key: "categories", label: "Categorías", icon: "bi-tags" },
    { key: "sales", label: "Ventas", icon: "bi-graph-up-arrow" },
];

const navItemClasses = (active: boolean) =>
    `flex h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary/50 ${active
        ? "bg-primary text-secondary shadow-[0_10px_25px_-8px] shadow-primary/50"
        : "text-secondary/50 hover:bg-secondary/5 hover:text-secondary"
    }`;

const Sidebar = ({ activeItem, setActiveItem }: SidebarProps) => {
    const { data: user } = useMe();

    const fullName = [user?.name, user?.surname].filter(Boolean).join(" ");
    const initials = `${user?.name?.[0] ?? ""}${user?.surname?.[0] ?? ""}`.toUpperCase();

    const navigate = useNavigate();

    const { mutate: logout } = useLogout();

    const handleLogout = () => {
        logout(undefined, {
            onSuccess: () => {
                navigate("/login");
            },
        });
    };

    return (
        <aside className="flex w-full shrink-0 flex-col gap-8 bg-tertiary px-4 py-6 md:fixed md:inset-y-0 md:left-0 md:w-64 md:gap-10 md:overflow-y-auto md:px-5 md:py-8 xl:w-72 xl:px-6 2xl:w-80">
            <div className="flex items-center gap-3">
                <img
                    src="/images/logo.png"
                    alt="Logo"
                    className="h-10 w-10 rounded-lg object-contain xl:h-11 xl:w-11"
                />
                <div className="min-w-0">
                    <p className="truncate text-base font-bold text-secondary xl:text-lg">
                        Catálogo
                    </p>
                    <p className="truncate text-xs text-secondary/50">
                        Tu gestor de productos
                    </p>
                </div>
            </div>

            <nav className="flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                    <ul className="flex flex-col gap-1">
                        {menuItems.map((item) => (
                            <li key={item.key}>
                                <button
                                    type="button"
                                    onClick={() => setActiveItem(item.key)}
                                    aria-current={activeItem === item.key ? "page" : undefined}
                                    className={navItemClasses(activeItem === item.key)}
                                >
                                    <i className={`bi ${item.icon} w-5 text-center text-base`} aria-hidden="true" />
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-auto flex flex-col gap-1 border-t border-secondary/15 pt-4">
                    <button
                        type="button"
                        onClick={() => setActiveItem("settings")}
                        aria-current={activeItem === "settings" ? "page" : undefined}
                        className={navItemClasses(activeItem === "settings")}
                    >
                        <i className="bi bi-sliders w-5 text-center text-base" aria-hidden="true" />
                        Ajustes
                    </button>
                </div>
            </nav>

            <div className="flex items-center gap-3 border-t border-secondary/15 pt-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-secondary">
                    {initials || "?"}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-secondary">
                        {fullName || "Usuario"}
                    </p>
                    <p className="text-xs text-secondary/50">Administrador</p>
                </div>
                <button
                    type="button"
                    aria-label="Cerrar sesión"
                    title="Cerrar sesión"
                    className="flex cursor-pointer h-9 w-9 shrink-0 items-center justify-center rounded-lg text-secondary/50 outline-none transition-colors duration-150 hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/50"
                    onClick={handleLogout}
                >
                    <i className="bi bi-box-arrow-right text-base" aria-hidden="true" />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
