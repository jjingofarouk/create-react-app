import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, X } from "lucide-react";

const AutocompleteInput = ({ options = [], value = "", onChange, placeholder = "Type to search...", allowNew = false, icon }) => {
  const [inputValue, setInputValue] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!Array.isArray(options)) {
      console.warn('AutocompleteInput: options should be an array, received:', typeof options);
      setFilteredOptions([]);
      return;
    }

    const validOptions = options.filter(option => 
      option && typeof option === 'object' && option.id && option.name && option.name.trim() !== ''
    );

    if (inputValue.trim() === '') {
      setFilteredOptions(validOptions.slice(0, 10));
    } else {
      const filtered = validOptions.filter(option =>
        option.name.toLowerCase().includes(inputValue.toLowerCase().trim()) ||
        option.id.toLowerCase().includes(inputValue.toLowerCase().trim())
      );
      setFilteredOptions(filtered.slice(0, 10));
    }
    
    setHighlightedIndex(-1);
  }, [inputValue, options]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (!showDropdown && newValue.length > 0) {
      setShowDropdown(true);
    }
    
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleOptionSelect = (option) => {
    const selectedValue = allowNew ? option.name : option.id;
    setInputValue(option.name);
    setShowDropdown(false);
    setHighlightedIndex(-1);
    
    if (onChange) {
      onChange(selectedValue);
    }
  };

  const handleClear = () => {
    setInputValue("");
    setShowDropdown(false);
    setHighlightedIndex(-1);
    
    if (onChange) {
      onChange("");
    }
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || filteredOptions.length === 0) {
      if (e.key === 'ArrowDown') {
        setShowDropdown(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        } else if (filteredOptions.length === 1) {
          handleOptionSelect(filteredOptions[0]);
        } else if (allowNew && inputValue.trim()) {
          handleOptionSelect({ id: inputValue, name: inputValue });
        }
        break;
      
      case 'Escape':
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
      
      default:
        break;
    }
  };

  const handleFocus = () => {
    if (filteredOptions.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleClickOutside = (event) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {icon}
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`w-full px-3 py-2 ${icon ? 'pl-10' : ''} pr-8 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors`}
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {inputValue ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-neutral-400 hover:text-neutral-600 p-1 rounded transition-colors"
              tabIndex={-1}
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <ChevronDown 
              className={`w-4 h-4 text-neutral-400 transition-transform ${
                showDropdown ? 'rotate-180' : ''
              }`} 
            />
          )}
        </div>
      </div>

      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={`${option.id}-${index}`}
                onClick={() => handleOptionSelect(option)}
                className={`px-4 py-2 cursor-pointer transition-colors ${
                  index === highlightedIndex 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-neutral-50 text-neutral-800'
                }`}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {option.name}
              </div>
            ))
          ) : allowNew && inputValue.trim() ? (
            <div
              onClick={() => handleOptionSelect({ id: inputValue, name: inputValue })}
              className="px-4 py-2 cursor-pointer hover:bg-neutral-50 text-neutral-800"
            >
              Create "{inputValue}"
            </div>
          ) : (
            <div className="px-4 py-2 text-neutral-500 text-sm">
              No matches found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;