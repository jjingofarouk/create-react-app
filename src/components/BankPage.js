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

const BankPage = ({ bankDeposits, userId, clients }) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [depositor, setDepositor] = useState('');
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [sorting, setSorting] = useState([]);

  const handleAddDeposit = async (e) => {
    e.preventDefault();
    if (!amount || !date || !depositor) return;

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

  const handleAddPerson = async (e) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;

    try {
      const docRef = await addDoc(collection(db, `users/${userId}/clients`), {
        name: newPersonName.trim(),
        createdAt: new Date().toISOString(),
      });
      setDepositor(docRef.id);
      setNewPersonName('');
      setShowAddPersonModal(false);
    } catch (error) {
      console.error('Error adding person:', error);
    }
  };

  const handleDeleteDeposit = async (id) => {
    try {
      await deleteDoc(doc(db, `users/${userId}/bankDeposits`, id));
    } catch (error) {
      console.error('Error deleting deposit:', error);
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
        cell: (info) => {
          const depositorId = info.getValue();
          const depositor = clients.find(client => client.id === depositorId);
          return depositor ? depositor.name : depositorId;
        },
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
    [handleDeleteDeposit, clients]
  );

  const table = useReactTable({
    data: bankDeposits || [],
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
            <AutocompleteInput
              options={clients}
              value={clients.find(c => c.id === depositor)?.name || ''}
              onChange={(value) => {
                const selectedClient = clients.find(c => c.name === value);
                setDepositor(selectedClient ? selectedClient.id : value);
              }}
              placeholder="Select depositor..."
              allowNew={true}
              icon={<Users className="w-5 h-5 text-neutral-400" />}
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Deposit
            </button>
            <button
              type="button"
              onClick={() => setShowAddPersonModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all duration-200 flex items-center gap-2"
            >
              <Users className="w-5 h-5" />
              Add New Person
            </button>
          </div>
        </form>
      </div>

      {/* Add Person Modal */}
      {showAddPersonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Person</h3>
              <button
                onClick={() => setShowAddPersonModal(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddPerson} className="space-y-4">
              <input
                type="text"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                placeholder="Enter person name"
                className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Person
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPersonModal(false)}
                  className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded-lg font-medium hover:bg-neutral-300 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table Container with Fixed Height and Horizontal Scroll */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-semibold">Deposits History</h3>
          <p className="text-sm text-neutral-600 mt-1">
            Total deposits: {bankDeposits?.length || 0}
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