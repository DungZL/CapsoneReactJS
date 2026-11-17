import React from 'react';

// Returns page numbers with "..." gaps, e.g. 1 2 3 ... 9 10
const buildPages = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('...');
    result.push(p);
  });
  return result;
};

export default function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;

  const go = (page) => {
    if (page >= 1 && page <= total && page !== current) onChange(page);
  };

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="page-btn"
        onClick={() => go(current - 1)}
        disabled={current === 1}
        aria-label="Previous page"
      >
        <i className="fa-solid fa-chevron-left"></i>
      </button>
      {buildPages(current, total).map((p, i) =>
        p === '...' ? (
          <span key={`gap-${i}`} className="page-gap">
            ...
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={`page-btn ${p === current ? 'active' : ''}`}
            onClick={() => go(p)}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        className="page-btn"
        onClick={() => go(current + 1)}
        disabled={current === total}
        aria-label="Next page"
      >
        <i className="fa-solid fa-chevron-right"></i>
      </button>
    </nav>
  );
}
