'use client'
import React, { useState, useRef, useEffect } from 'react';

interface Item {
  id: number;
  name: string;
  [key: string]: any; // For other properties
}

interface MultiSelectProps<T extends Item = Item> {
  items: T[];
  selectedItems: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  label: string;
  placeholder: string;
  disabled?: boolean;
  displayPattern?: (item: T) => string;
}

export const MultiSelect = <T extends Item = Item>({
  items,
  selectedItems,
  onSelectionChange,
  label,
  placeholder,
  disabled = false,
  displayPattern = (item) => item.name,
}: MultiSelectProps<T>): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const allItemIds = items.map(item => item.id.toString());
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  // Filter items based on search query
  const filteredItems = items.filter(item => 
    displayPattern(item).toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Reset search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (allSelected) {
      // If all are selected, deselect all
      onSelectionChange([]);
    } else {
      // Otherwise select all
      onSelectionChange([...allItemIds]);
    }
  };

  // Handle item selection
  const handleItemSelect = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      // Item is already selected, remove it
      onSelectionChange(selectedItems.filter(id => id !== itemId));
    } else {
      // Item is not selected, add it
      onSelectionChange([...selectedItems, itemId]);
    }
  };

  // Format the display text
  const getDisplayText = () => {
    if (selectedItems.length === 0) {
      return placeholder;
    }
    
    if (allSelected) {
      return `All ${label}s`;
    }
    
    if (selectedItems.length === 1) {
      const selected = items.find(item => item.id.toString() === selectedItems[0]);
      return selected ? displayPattern(selected) : placeholder;
    }
    
    return `${selectedItems.length} ${label}s selected`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}:
      </label>
      <div
        className={`w-full p-2 text-sm border border-blue-500 rounded-md flex justify-between items-center cursor-pointer ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
        }`}
        onClick={toggleDropdown}
      >
        <span className={selectedItems.length === 0 ? 'text-gray-400' : ''}>
          {getDisplayText()}
        </span>
        <svg
          className="w-4 h-4 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={isOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
          />
        </svg>
      </div>
      
      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {/* Search box */}
          <div className="sticky top-0 p-2 border-b border-gray-200 bg-white">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder={`Search ${label}s...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing
              />
              {searchQuery && (
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* Select All option */}
          <div
            className={`p-2 hover:bg-blue-100 cursor-pointer border-b border-gray-200 font-medium ${
              allSelected ? 'bg-blue-50' : ''
            }`}
            onClick={handleSelectAll}
          >
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
              className="mr-2"
            />
            All {label}s
          </div>
          
          {/* No results message */}
          {filteredItems.length === 0 && (
            <div className="p-3 text-center text-gray-500">
              No {label}s found matching "{searchQuery}"
            </div>
          )}
          
          {/* Individual items */}
          {filteredItems.map(item => (
            <div
              key={item.id}
              className={`p-2 hover:bg-blue-100 cursor-pointer ${
                selectedItems.includes(item.id.toString()) ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleItemSelect(item.id.toString())}
            >
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id.toString())}
                onChange={() => handleItemSelect(item.id.toString())}
                className="mr-2"
              />
              {displayPattern(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};