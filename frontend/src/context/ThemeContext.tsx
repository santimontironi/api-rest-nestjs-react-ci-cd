import { createContext, useEffect, useState, type ReactNode } from "react";
import type { themes } from "../types/general.types";

interface ThemeContextData {
    theme: themes,
    setTheme: (theme: themes) => void
}

const LOCAL_STORAGE_KEY = 'theme'

const ThemeContext = createContext<ThemeContextData | null>(null)

export const ThemeContextProvider = ({ children }: { children: ReactNode }) => {

    const [theme, setTheme] = useState<themes>(
        () => (localStorage.getItem(LOCAL_STORAGE_KEY) as themes | null) ?? 'dark'
    )

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem(LOCAL_STORAGE_KEY, theme)
    }, [theme])

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export default ThemeContext