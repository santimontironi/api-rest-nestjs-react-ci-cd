import { useContext } from "react";
import ThemeContext from "../../context/ThemeContext";

const Settings = () => {
  const themeContext = useContext(ThemeContext);

  if (!themeContext) return null;

  const { theme, setTheme } = themeContext;
  const isLight = theme === "light";

  const toggleTheme = () => setTheme(isLight ? "dark" : "light");

  return (
    <div className="flex flex-col gap-8 xl:gap-10">
      <h1 className="text-2xl font-bold text-tertiary md:text-3xl xl:text-4xl">Ajustes</h1>

      <div className="flex items-center justify-between gap-4 rounded-2xl border border-tertiary/10 bg-tertiary/5 px-6 py-5">
        <div className="flex items-center gap-3">
          <i className={`bi ${isLight ? "bi-sun" : "bi-moon-stars"} text-lg text-primary`} aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-tertiary">Modo claro</p>
            <p className="text-xs text-tertiary/60">Cambia la apariencia de la aplicación</p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          role="switch"
          aria-checked={isLight}
          aria-label="Cambiar a modo claro"
          className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary/50 ${isLight ? "bg-primary" : "bg-tertiary/20"}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-secondary transition-transform duration-150 ${isLight ? "translate-x-5" : "translate-x-0"}`}
          />
        </button>
      </div>
    </div>
  );
};

export default Settings;
