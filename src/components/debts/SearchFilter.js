import React from "react";
import { Search, X } from "lucide-react";

const SearchFilter = ({ filter, setFilter, filteredDebts }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search debts by client name..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all duration-200"
          />
          {filter && (
            <button
              onClick={() => setFilter("")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        {filteredDebts.length > 0 && (
          <div className="text-sm text-neutral-600 bg-neutral-50 px-3 py-2 rounded-lg">
            {filteredDebts.length} debt{filteredDebts.length !== 1 ? 's' : ''} found
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;