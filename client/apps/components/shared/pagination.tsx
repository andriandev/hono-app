"use client";

import React from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  around?: number;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  around = 2,
}: PaginationProps) {
  function getPagination(
    current: number,
    total: number,
    range: number,
  ): number[] {
    const start = Math.max(1, current - range);
    const end = Math.min(total, current + range);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  const pages = getPagination(currentPage, totalPages, around);

  return (
    <>
      <div className="mt-5 mb-3 flex items-center justify-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`rounded px-3 py-1 ${
            currentPage === 1
              ? "cursor-not-allowed bg-slate-700"
              : "bg-indigo-700 hover:bg-indigo-800"
          }`}
        >
          Prev
        </button>

        {pages.map((page) =>
          page === currentPage ? (
            <button
              key={page}
              className={`cursor-not-allowed rounded bg-slate-700 px-3 py-1`}
            >
              {page}
            </button>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`rounded bg-indigo-700 px-3 py-1 hover:bg-indigo-800`}
            >
              {page}
            </button>
          ),
        )}

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`rounded px-3 py-1 ${
            currentPage === totalPages
              ? "cursor-not-allowed bg-slate-700"
              : "bg-indigo-700 hover:bg-indigo-800"
          }`}
        >
          Next
        </button>
      </div>
      <div className="flex items-center justify-center gap-2">
        Page {currentPage} of {totalPages}
      </div>
    </>
  );
}
