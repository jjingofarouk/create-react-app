import React from "react";
import { format, parseISO } from "date-fns";
import { Calendar, X } from "lucide-react";

const DateFilter = ({ dateFilter, setDateFilter, showDateFilter, setShowDateFilter }) => {
  const handleDateFilterChange = (type) => {
    setDateFilter(prev => ({
      ...prev,
      type,
      startDate: type === 'custom' ? prev.startDate : '',
      endDate: type === 'custom' ? prev.endDate : ''
    }));
    if (type !== 'custom') {
      setShowDateFilter(false);
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
    <div className="fixed bottom-20 right-4 z-40">
      <div className="relative">
        <button
          onClick={() => setShowDateFilter(!showDateFilter)}
          className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300 ${
            dateFilter.type !== 'all' 
              ? 'bg-primary text-white' 
              : 'bg-white text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-sm font-medium">{getDateFilterLabel()}</span>
        </button>
        
        {showDateFilter && (
          <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-xl border border-neutral-200 p-4 w-80 max-w-[90vw]">
            <div className="space-y-3">
              <h4 className="font-semibold text-neutral-800 mb-3">Filter by Date</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDateFilterChange('all')}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    dateFilter.type === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  All Time
                </button>
                <button
                  onClick={() => handleDateFilterChange('today')}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    dateFilter.type === 'today'
                      ? 'bg-primary text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => handleDateFilterChange('week')}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    dateFilter.type === 'week'
                      ? 'bg-primary text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => handleDateFilterChange('month')}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    dateFilter.type === 'month'
                      ? 'bg-primary text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  This Month
                </button>
              </div>
              
              <div className="pt-2 border-t border-neutral-200">
                <button
                  onClick={() => handleDateFilterChange('custom')}
                  className={`w-full px-3 py-2 rounded-lg text-sm transition-colors mb-3 ${
                    dateFilter.type === 'custom'
                      ? 'bg-primary text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  Custom Range
                </button>
                
                {dateFilter.type === 'custom' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-neutral-600 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={dateFilter.startDate}
                        onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-600 mb-1">End Date</label>
                      <input
                        type="date"
                        value={dateFilter.endDate}
                        onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setShowDateFilter(false)}
                className="w-full px-3 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-sm hover:bg-neutral-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateFilter;
