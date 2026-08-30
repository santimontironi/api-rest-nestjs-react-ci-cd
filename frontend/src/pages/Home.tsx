import { useState } from "react";
import type { sidebarItems } from "../types/general.types";
import Sidebar from "../components/ui/Sidebar";
import Dashboard from "../components/dashboard/Dashboard";
import Products from "../components/products/Products";
import Categories from "../components/categories/Categories";
import Sales from "../components/sales/Sales";
import Settings from "../components/ui/Settings";
import Customers from "../components/customers/Customers";

const Home = () => {

    const [activeItem, setActiveItem] = useState<sidebarItems>('dashboard');

    return (
        <div className="flex min-h-screen flex-col bg-secondary md:flex-row">
            <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />

            <main className="flex-1 overflow-y-auto p-4 md:ml-64 md:h-screen md:p-8 xl:ml-72 xl:p-10 2xl:ml-80 2xl:p-12">
                {activeItem === 'dashboard' && <Dashboard />}
                {activeItem === 'products' && <Products />}
                {activeItem === 'categories' && <Categories />}
                {activeItem === 'sales' && <Sales />}
                {activeItem === 'settings' && <Settings />}
                {activeItem === 'customers' && <Customers />}
            </main>
        </div>
    )
}

export default Home