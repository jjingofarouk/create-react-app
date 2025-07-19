import React, { useMemo } from "react";
import { 
  useReactTable, 
  getCoreRowModel, 
  getFilteredRowModel, 
  getSortedRowModel,
  flexRender 
} from "@tanstack/react-table";
import { format, startOfDay, endOfDay, isWithinInterval, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { Edit, Trash2, Search, X } from "lucide-react";
import { collection, deleteDoc, doc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const SalesTable = ({ sales, products, globalFilter, setGlobalFilter, dateFilter, userId, setEditingSale, setShowForm }) => {
  const filteredSales = useMemo(() => {
    if (!sales) return [];
    
    if (dateFilter.type === 'all') return sales;
    
    const now = new Date();
    let startDate, endDate;
    
    switch (dateFilter.type) {
      case 'today':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'week':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'custom':
        if (!dateFilter.startDate || !dateFilter.endDate) return sales;
        startDate = startOfDay(parseISO(dateFilter.startDate));
        endDate = endOfDay(parseISO(dateFilter.endDate));
        break;
      default:
        return sales;
    }
    
    return sales.filter(sale => {
      if (!sale.date) return false;
      const saleDate = sale.date.toDate();
      return isWithinInterval(saleDate, { start: startDate, end: endDate });
    });
  }, [sales, dateFilter]);

  const columns = useMemo(
    () => [
      {
        header: "Client",
        accessorKey: "client",
        cell: info => (
          <div className="font-medium text-neutral-900">
            {info.getValue() || "-"}
          </div>
        ),
      },
      {
        header: "Product",
        accessorKey: "product",
        cell: info => (
          <div className="text-neutral-800">
            {products.find(prod => prod.id === info.getValue()?.productId)?.name || "-"}
          </div>
        ),
      },
      {
        header: "Quantity",
        accessorKey: "product",
        cell: info => (
          <div className="text-center font-medium">
            {info.getValue()?.quantity || 0}
          </div>
        ),
      },
      {
        header: "Unit Price",
        accessorKey: "product",
        cell: info => (
          <div className="font-mono text-sm">
            UGX {(info.getValue()?.unitPrice || 0).toLocaleString()}
          </div>
        ),
      },
      {
        header: "Discount",
        accessorKey: "product",
        cell: info => (
          <div className="font-mono text-sm text-orange-600">
            {info.getValue()?.discount > 0 ? `-UGX ${info.getValue().discount.toLocaleString()}` : "-"}
          </div>
        ),
      },
      {
        header: "Total",
        accessorKey: "totalAmount",
        cell: info => (
          <div className="font-mono font-semibold text-primary">
            UGX {(info.getValue() || 0).toLocaleString()}
          </div>
        ),
      },
      {
        header: "Payment Status",
        accessorKey: "paymentStatus",
        cell: info => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            info.getValue() === 'paid' ? 'bg-green-100 text-green-800' :
            info.getValue() === 'partial' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {(info.getValue() || 'unpaid').charAt(0).toUpperCase() + (info.getValue() || 'unpaid').slice(1)}
          </span>
        ),
      },
      {
        header: "Amount Paid",
        accessorKey: "amountPaid",
        cell: info => (
          <div className="font-mono text-sm">
            UGX {(info.getValue() || 0).toLocaleString()}
          </div>
        ),
      },
      {
        header: "Date",
        accessorKey: "date",
        cell: info => (
          <div className="text-sm text-neutral-600">
            {info.getValue() ? format(info.getValue().toDate(), 'MMM dd, yyyy') : '-'}
          </div>
        ),
      },
      {
        header: "Actions",
        cell: info => (
          <div className="flex gap-1">
            <button
              onClick={() => {
                setEditingSale(info.row.original);
                setShowForm(true);
              }}
              className="p-2 text-neutral-500 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit sale"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteSale(info.row.original.id)}
              className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete sale"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [products, setEditingSale, setShowForm]
  );

  const table = useReactTable({
    data: filteredSales || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const client = row.getValue('client')?.toLowerCase() || '';
      const product = products.find(prod => prod.id === row.getValue('product')?.productId)?.name.toLowerCase() || '';
      const paymentStatus = row.getValue('paymentStatus')?.toLowerCase() || '';
      const searchTerm = filterValue.toLowerCase();
      return client.includes(searchTerm) || product.includes(searchTerm) || paymentStatus.includes(searchTerm);
    },
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const handleDeleteSale = async (id) => {
    if (window.confirm("Are you sure you want to delete this sale? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, `users/${userId}/sales`, id));
        const debtsQuery = query(
          collection(db, `users/${userId}/debts`),
          where("saleId", "==", id)
        );
        const querySnapshot = await getDocs(debtsQuery);
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
      } catch (err) {
        console.error("Error deleting sale:", err);
        alert("Failed to delete sale. Please try again.");
      }
    }
  };

  const getDateFilterLabel = () => {
    switch (dateFilter.type) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'custom':
        return dateFilter.startDate && dateFilter.endDate 
          ? `${format(parseISO(dateFilter.startDate), 'MMM dd')} - ${format(parseISO(dateFilter.endDate), 'MMM dd')}`
          : 'Custom Range';
      default:
        return 'All Time';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 w-full max-w-full">
      <div className="p-4 border-b border-neutral-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold text-neutral-800">
            Sales Records ({filteredSales.length})
            {dateFilter.type !== 'all' && (
              <span className="text-sm font-normal text-neutral-500 ml-2">
                • {getDateFilterLabel()}
              </span>
            )}
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by client, product, or status..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-neutral-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            {globalFilter && (
              <button
                onClick={() => setGlobalFilter("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="relative max-h-[600px] overflow-auto">
        <table className="w-full divide-y divide-neutral-200 min-w-[900px]">
          <thead className="bg-neutral-50 sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors whitespace-nowrap"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      <span className="text-neutral-400">
                        {{
                          asc: '↑',
                          desc: '↓',
                        }[header.column.getIsSorted()] ?? '↕'}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-neutral-50 transition-colors">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 text-sm whitespace-nowrap">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {table.getRowModel().rows.length === 0 && (
        <div className="text-center py-12 text-neutral-500">
          <div className="mb-2">
            {globalFilter ? "No matching sales found" : "No sales recorded yet"}
          </div>
          {!globalFilter && (
            <button
              onClick={() => {
                setEditingSale(null);
                setShowForm(true);
              }}
              className="text-primary hover:text-blue-700 font-medium"
            >
              Create your first sale
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesTable;
