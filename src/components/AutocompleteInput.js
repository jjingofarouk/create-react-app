import React, { useState } from "react";

function AutocompleteInput({ value, onChange, suggestions, placeholder }) {
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (e) => {
    const input = e.target.value;
    onChange(input);
    if (input) {
      const filtered = suggestions.filter((sug) =>
        sug.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="autocomplete">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="suggestions">
          {filteredSuggestions.map((sug, index) => (
            <li key={index} onClick={() => handleSuggestionClick(sug)}>
              {sug}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AutocompleteInput;
