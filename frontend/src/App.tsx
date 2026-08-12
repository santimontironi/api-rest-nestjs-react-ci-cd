import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClientProvider } from '@tanstack/react-query'
import Login from "./pages/Login"
import ResetPassword from "./pages/ResetPassword"
import queryClient from "./queryClient"

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App