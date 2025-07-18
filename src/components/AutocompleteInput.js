import React, { useState, useEffect } from "react";

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
    // Delay hiding suggestions to allow clicking
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
    <div className="autocomplete">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="suggestions">
          {filteredSuggestions.slice(0, 5).map((sug, index) => (
            <li 
              key={index} 
              onClick={() => handleSuggestionClick(sug)}
              onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
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