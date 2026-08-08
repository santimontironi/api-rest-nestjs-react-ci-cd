import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClientProvider } from '@tanstack/react-query'
import Register from "./pages/Register"
import Login from "./pages/Login"
import Confirm from "./pages/Confirm"
import queryClient from "./queryClient"

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/confirmar/:token" element={<Confirm />} />
          <Route />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App