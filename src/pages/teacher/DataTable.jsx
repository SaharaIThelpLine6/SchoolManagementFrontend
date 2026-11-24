import React from 'react';

export const DataTable = ({
  children,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  isLoading = false,
  isEmpty = false,
  emptyTitle,
  emptyDescription,
  emptyAction,
  skeletonCols = 5,
  toolbarRight,
}) => {
  const showSearch = typeof onSearchChange === 'function';

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      {(showSearch || toolbarRight) && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 border-b border-slate-200">
          {showSearch ? (
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-9 pl-9 pr-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
              />
            </div>
          ) : (
            <div />
          )}
          {toolbarRight && <div className="shrink-0">{toolbarRight}</div>}
        </div>
      )}

      {/* Body */}
      {isLoading ? (
        <div className="p-4 space-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              {Array.from({ length: skeletonCols }).map((__, j) => (
                <div
                  key={j}
                  className="h-9 flex-1 bg-slate-100 rounded animate-pulse"
                />
              ))}
            </div>
          ))}
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <path d="M8 12h8" />
            </svg>
          </div>
          <h4 className="text-sm font-semibold text-slate-900">
            {emptyTitle ?? 'No data found'}
          </h4>
          {emptyDescription && (
            <p className="mt-1 text-sm text-slate-500 max-w-sm">
              {emptyDescription}
            </p>
          )}
          {emptyAction && <div className="mt-4">{emptyAction}</div>}
        </div>
      ) : (
        <div className="overflow-x-auto">{children}</div>
      )}
    </div>
  );
};