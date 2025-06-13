import React, { useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { useStore } from "../store";

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState("");
  const { searchNodes, searchResults } = useStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchNodes(query);
  };

  const handleClear = () => {
    setQuery("");
    searchNodes("");
  };

  return (
    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Search by tag, id, class, or text..."
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <FiX className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" />
            </button>
          )}
        </div>
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {searchResults.length > 0 && (
            <span>
              {searchResults.length} result
              {searchResults.length !== 1 ? "s" : ""} found
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
