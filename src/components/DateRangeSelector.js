import React, { useState, useEffect } from "react";
import { format, startOfDay, startOfWeek, startOfMonth, subDays, subWeeks, subMonths } from "date-fns";
import { Calendar, X } from "lucide-react";

const DateRangeSelector = ({ dateFilter, setDateFilter }) => {
  const [showCustomInputs, setShowCustomInputs] = useState(dateFilter.type === "custom");
  const [error, setError] = useState("");

  // Handle predefined date range selection
  const handlePresetChange = (type) => {
    const today = new Date();
    let newFilter = { type, startDate: "", endDate: "" };

    switch (type) {
      case "today":
        newFilter = {
          type,
          startDate: format(startOfDay(today), "yyyy-MM-dd"),
          endDate: format(today, "yyyy-MM-dd"),
        };
        break;
      case "week":
        newFilter = {
          type,
          startDate: format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd"),
          endDate: format(today, "yyyy-MM-dd"),
        };
        break;
      case "month":
        newFilter = {
          type,
          startDate: format(startOfMonth(today), "yyyy-MM-dd"),
          endDate: format(today, "yyyy-MM-dd"),
        };
        break;
      case "custom":
        newFilter = {
          type,
          startDate: dateFilter.startDate || format(subDays(today, 7), "yyyy-MM-dd"),
          endDate: dateFilter.endDate || format(today, "yyyy-MM-dd"),
        };
        setShowCustomInputs(true);
        break;
      case "all":
        setShowCustomInputs(false);
        break;
      default:
        break;
    }

    setDateFilter(newFilter);
    setError("");
  };

  // Validate custom date range
  const validateDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return false;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      setError("Start date cannot be after end date.");
      return false;
    }
    return true;
  };

  // Handle custom date input changes
  const handleCustomDateChange = (field, value) => {
    const newFilter = { ...dateFilter, [field]: value };
    setDateFilter(newFilter);
    if (validateDateRange(newFilter.startDate, newFilter.endDate)) {
      setError("");
    }
  };

  // Reset to "All Time"
  const handleReset = () => {
    setDateFilter({ type: "all", startDate: "", endDate: "" });
    setShowCustomInputs(false);
    setError("");
  };

  // Update custom inputs visibility when type changes
  useEffect(() => {
    setShowCustomInputs(dateFilter.type === "custom");
  }, [dateFilter.type]);

  return (
    <div className="w-full sm:w-96">
      <div className="card">
        <div className="card-header">
          <h3 className="text-sm font-semibold text-neutral-800">Date Range</h3>
        </div>
        <div className="card-content space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={dateFilter.type}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="form-input w-full sm:w-40"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
            {dateFilter.type !== "all" && (
              <button
                onClick={handleReset}
                className="btn-secondary flex items-center gap-2 justify-center"
              >
                <X className="w-4 h-4" />
                <span>Clear</span>
              </button>
            )}
          </div>
          {showCustomInputs && (
            <div className="space-y-3 animate-slide-up">
              <div>
                <label className="form-label">Start Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={dateFilter.startDate}
                    onChange={(e) => handleCustomDateChange("startDate", e.target.value)}
                    className="form-input pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                </div>
              </div>
              <div>
                <label className="form-label">End Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={dateFilter.endDate}
                    onChange={(e) => handleCustomDateChange("endDate", e.target.value)}
                    className="form-input pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                </div>
              </div>
              {error && (
                <p className="text-sm text-danger-600">{error}</p>
              )}
            </div>
          )}
          {dateFilter.type !== "all" && (
            <p className="text-sm text-neutral-600">
              Showing data from{" "}
              {dateFilter.startDate
                ? format(new Date(dateFilter.startDate), "MMM dd, yyyy")
                : "start"}{" "}
              to{" "}
              {dateFilter.endDate
                ? format(new Date(dateFilter.endDate), "MMM dd, yyyy")
                : "today"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateRangeSelector;