import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

function AutocompleteInput({ value, onChange, suggestions, placeholder, disabled = false }) {
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (disabled) {
      setShowSuggestions(false);
    }
  }, [disabled]);

  const handleInputChange = (e) => {
    const input = e.target.value;
    onChange(input);
    
    if (input && !disabled) {
      const filtered = suggestions.filter((sug) =>
        sug.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleFocus = () => {
    if (value && !disabled) {
      const filtered = suggestions.filter((sug) =>
        sug.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="w-full pl-10 pr-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-neutral-800 placeholder-neutral-400 disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 bg-white border-2 border-t-0 border-neutral-200 rounded-b-lg max-h-48 overflow-y-auto z-10 shadow-md">
          {filteredSuggestions.slice(0, 5).map((sug, index) => (
            <li 
              key={index} 
              onClick={() => handleSuggestionClick(sug)}
              onMouseDown={(e) => e.preventDefault()}
              className="px-4 py-3 cursor-pointer border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 transition-colors duration-200"
            >
              {sug}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AutocompleteInput;