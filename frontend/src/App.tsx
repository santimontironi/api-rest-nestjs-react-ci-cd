import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClientProvider } from '@tanstack/react-query'
import Login from "./pages/Login"
import ResetPassword from "./pages/ResetPassword"
import Home from "./pages/Home"
import VerifyAuth from "./components/auth/VerifyAuth"
import queryClient from "./queryClient"
import { ThemeContextProvider } from "./context/ThemeContext"

const App = () => {
  return (
    <ThemeContextProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/restablecer-contrasena/:token" element={<ResetPassword />} />
            <Route path="/inicio" element={ <VerifyAuth>
              <Home />
            </VerifyAuth>} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeContextProvider>
  )
}

export default App