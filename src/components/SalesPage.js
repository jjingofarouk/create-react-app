import React, { useState, useMemo } from "react";
import { 
  useReactTable, 
  getCoreRowModel, 
  getFilteredRowModel, 
  getSortedRowModel,
  flexRender 
} from "@tanstack/react-table";
import { format, startOfDay, endOfDay, isWithinInterval, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  X, 
  User, 
  Package, 
  Calendar,
  CalendarDays,
  TrendingUp,
  Award,
  DollarSign,
  Users
} from "lucide-react";
import AutocompleteInput from "./AutocompleteInput";
import SalesForm from "./SalesForm";
import SalesAnalytics from "./SalesAnalytics";
import DateFilter from "./DateFilter";
import ClientForm from "./ClientForm";
import ProductForm from "./ProductForm";
import SalesTable from "./SalesTable";

const SalesPage = ({ sales, clients, products, userId }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    type: 'all',
    startDate: '',
    endDate: ''
  });
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });
  const [newClient, setNewClient] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    address: "" 
  });

  return (
    <div className="space-y-6 max-w-[100vw] overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Sales Records</h2>
          <p className="text-sm text-neutral-600 mt-1">
            Manage your sales transactions and track payments
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setEditingSale(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Sale</span>
          </button>
          <button
            onClick={() => setShowClientForm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            <User className="w-4 h-4" />
            <span>Add Client</span>
          </button>
          <button
            onClick={() => setShowProductForm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <Package className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <DateFilter
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        showDateFilter={showDateFilter}
        setShowDateFilter={setShowDateFilter}
      />

      {sales && sales.length > 0 && (
        <SalesAnalytics sales={sales} products={products} dateFilter={dateFilter} />
      )}

      <SalesTable
        sales={sales}
        products={products}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        dateFilter={dateFilter}
        userId={userId}
        setEditingSale={setEditingSale}
        setShowForm={setShowForm}
      />

      {showForm && (
        <SalesForm
          sale={editingSale}
          clients={clients}
          products={products}
          userId={userId}
          onClose={() => {
            setShowForm(false);
            setEditingSale(null);
          }}
        />
      )}

      {showClientForm && (
        <ClientForm
          newClient={newClient}
          setNewClient={setNewClient}
          setShowClientForm={setShowClientForm}
          userId={userId}
        />
      )}

      {showProductForm && (
        <ProductForm
          newProduct={newProduct}
          setNewProduct={setNewProduct}
          setShowProductForm={setShowProductForm}
          userId={userId}
        />
      )}
    </div>
  );
};

export default SalesPage;
