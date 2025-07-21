import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import { db, addDoc, collection, deleteDoc, doc } from '../firebase';
import { Plus, Trash2, ChevronUp, ChevronDown, Users } from 'lucide-react';
import AutocompleteInput from './AutocompleteInput';

const BankPage = ({ bankDeposits, depositors, userId }) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [depositor, setDepositor] = useState('');
  const [showAddDepositorModal, setShowAddDepositorModal] = useState(false);
  const [newDepositorName, setNewDepositorName] = useState('');
  const [sorting, setSorting] = useState([]);

  // Create depositor options for autocomplete
  const depositorOptions = useMemo(() => {
    if (!depositors || !Array.isArray(depositors)) return [];
    return depositors.map((depositorName, index) => ({
      id: depositorName,
      name: depositorName
    }));
  }, [depositors]);

  const handleAddDeposit = async (e) => {
    e.preventDefault();
    if (!amount || !date) return;

    try {
      await addDoc(collection(db, `users/${userId}/bankDeposits`), {
        amount: parseFloat(amount),
        date,
        description,
        depositor,
        createdAt: new Date().toISOString(),
      });
      setAmount('');
      setDate('');
      setDescription('');
      setDepositor('');
    } catch (error) {
      console.error('Error adding deposit:', error);
    }
  };

  const handleDeleteDeposit = async (id) => {
    try {
      await deleteDoc(doc(db, `users/${userId}/bankDeposits`, id));
    } catch (error) {
      console.error('Error deleting deposit:', error);
    }
  };

  const handleAddNewDepositor = async () => {
    if (!newDepositorName.trim()) return;

    try {
      // Add a dummy deposit with the new depositor to create the depositor entry
      // This will be picked up by the listener and added to the depositors array
      await addDoc(collection(db, `users/${userId}/bankDeposits`), {
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: 'Depositor registration',
        depositor: newDepositorName.trim(),
        createdAt: new Date().toISOString(),
        isDepositorOnly: true, // Flag to identify this as just a depositor registration
      });
      
      setDepositor(newDepositorName.trim());
      setNewDepositorName('');
      setShowAddDepositorModal(false);
    } catch (error) {
      console.error('Error adding depositor:', error);
    }
  };

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor('date', {
        header: 'Date',
        cell: (info) => info.getValue(),
        minSize: 120,
      }),
      columnHelper.accessor('amount', {
        header: 'Amount',
        cell: (info) => `$${info.getValue().toFixed(2)}`,
        minSize: 100,
      }),
      columnHelper.accessor('depositor', {
        header: 'Depositor',
        cell: (info) => info.getValue() || '-',
        minSize: 150,
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: (info) => info.getValue() || '-',
        minSize: 200,
      }),
      columnHelper.accessor('id', {
        header: 'Actions',
        cell: (info) => (
          <button
            onClick={() => handleDeleteDeposit(info.getValue())}
            className="text-red-500 hover:text-red-700 transition-colors duration-200"
            title="Delete deposit"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        ),
        enableSorting: false,
        minSize: 80,
      }),
    ],
    [handleDeleteDeposit]
  );

  // Filter out depositor-only entries from the table display
  const displayDeposits = useMemo(() => {
    return (bankDeposits || []).filter(deposit => !deposit.isDepositorOnly);
  }, [bankDeposits]);

  const table = useReactTable({
    data: displayDeposits,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-800">Bank Deposits</h2>
      
      {/* Add New Deposit Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
        <h3 className="text-lg font-semibold mb-4">Add New Deposit</h3>
        <form onSubmit={handleAddDeposit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <div className="relative">
              <AutocompleteInput
                options={depositorOptions}
                value={depositor}
                onChange={setDepositor}
                placeholder="Select or type depositor"
                allowNew={true}
                icon={<Users className="w-5 h-5 text-neutral-400" />}
              />
              <button
                type="button"
                onClick={() => setShowAddDepositorModal(true)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                title="Add new depositor"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Deposit
          </button>
        </form>
      </div>

      {/* Add Depositor Modal */}
      {showAddDepositorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Depositor</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newDepositorName}
                onChange={(e) => setNewDepositorName(e.target.value)}
                placeholder="Depositor name"
                className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowAddDepositorModal(false);
                    setNewDepositorName('');
                  }}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNewDepositor}
                  disabled={!newDepositorName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Depositor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table Container with Fixed Height and Horizontal Scroll */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-semibold">Deposits History</h3>
          <p className="text-sm text-neutral-600 mt-1">
            Total deposits: {displayDeposits?.length || 0}
          </p>
        </div>
        
        {/* Fixed container with horizontal scroll */}
        <div className="overflow-x-auto max-w-full">
          <div className="min-w-full inline-block align-middle">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50 sticky top-0 z-10">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer select-none hover:bg-neutral-100 transition-colors duration-200"
                        onClick={header.column.getToggleSortingHandler()}
                        style={{ minWidth: header.column.columnDef.minSize }}
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <div className="flex flex-col">
                              {header.column.getIsSorted() === 'desc' && (
                                <ChevronDown className="w-4 h-4 text-blue-600" />
                              )}
                              {header.column.getIsSorted() === 'asc' && (
                                <ChevronUp className="w-4 h-4 text-blue-600" />
                              )}
                              {!header.column.getIsSorted() && (
                                <div className="w-4 h-4 opacity-30">
                                  <ChevronUp className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-8 text-center text-neutral-500"
                    >
                      No deposits found. Add your first deposit above.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr
                      key={row.id}
                      className="hover:bg-neutral-50 transition-colors duration-150"
                    >
                      {row.getVisibleCells().map(cell => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900"
                          style={{ minWidth: cell.column.columnDef.minSize }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankPage;