import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import React from "react";
import { useState } from "react";


export const CustomPagination = ({
  totalItems = 200,
  pageSize = 6,
  currentPage = 1,
  onPageChange,
  total_pages,
}) => {
  const totalPages = total_pages
    ? total_pages
    : Math.ceil(totalItems / pageSize);
  const [inputValue, setInputValue] = useState(currentPage.toString());

  React.useEffect(() => {
    setInputValue(currentPage.toString());
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;

    // Allow empty input for clearing
    if (value === "") {
      setInputValue("");
      return;
    }

    // Only allow numbers
    if (!/^\d+$/.test(value)) {
      return;
    }

    setInputValue(value);
  };

  const handleInputBlur = () => {
    if (inputValue === "") {
      // Reset to current page if input is empty on blur
      setInputValue(currentPage.toString());
      return;
    }

    const newPage = parseInt(inputValue, 10);
    if (newPage >= 1 && newPage <= totalPages) {
      handlePageChange(newPage);
    } else {
      // Reset to current page if input is invalid
      setInputValue(currentPage.toString());
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      handleInputBlur();
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <div className="flex items-center">
        <label htmlFor="page-number-input" className="sr-only">
          Go to page number
        </label>
        <input
          id="page-number-input"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          className="w-12 h-8 border border-gray-300 rounded px-2 text-center"
          aria-label="Page number input"
        />
        <span className="ml-2 text-gray-600">of {totalPages}</span>
      </div>

      <div className="flex gap-1">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
