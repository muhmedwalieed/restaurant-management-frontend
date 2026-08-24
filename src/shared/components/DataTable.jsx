import { LoadingSkeleton } from './LoadingSkeleton.jsx';
import { EmptyState } from './EmptyState.jsx';
import { Button } from './Button.jsx';
import { ChevronRight, ChevronLeft, Search, AlertCircle } from 'lucide-react';

export const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  isError = false,
  error = null,
  onRetry,
  pagination = null, // { page, totalPages, total, onPageChange }
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'ابحث هنا...',
  emptyTitle = 'لا توجد بيانات متاحة',
  emptyDescription = 'لم يتم العثور على أي نتائج حتّى الآن.',
  mobileCardRender, // Optional custom mobile card renderer
  actions, // Optional top right action bar
  filters, // Optional custom filter controls
  onRowClick, // Optional row click handler
}) => {
  return (
    <div className="space-y-4">
      {/* Header Bar: Search + Filters + Actions in a unified contiguous row */}
      {(onSearchChange || filters || actions) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-bg-surface p-3.5 border border-border-default rounded-lg">
          {/* Start Cluster: Search Input + Contiguous Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 min-w-0">
            {onSearchChange && (
              <div className="relative w-full sm:w-72 shrink-0">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-bg-base border border-border-default rounded-md text-xs px-3 py-2 pr-9 text-txt-primary placeholder:text-txt-muted focus-visible:outline-none focus-visible:border-brand-primary"
                />
                <Search className="w-4 h-4 text-txt-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            {filters && <div className="flex items-center gap-2 flex-wrap">{filters}</div>}
          </div>

          {/* End Cluster: Actions */}
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="bg-status-danger-bg border border-status-danger/30 rounded-lg p-6 text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-status-danger mx-auto" />
          <h4 className="text-sm font-bold text-txt-primary">فشل في تحميل البيانات</h4>
          <p className="text-xs text-txt-muted">{error?.message || 'حدث خطأ أثناء الاتصال بالخادم.'}</p>
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              إعادة المحاولة
            </Button>
          )}
        </div>
      )}

      {/* Desktop / Tablet Table View (Section 20.4) */}
      {!isError && (
        <div className="hidden md:block bg-bg-surface border border-border-default rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-bg-base text-txt-muted border-b border-border-default select-none">
                <tr>
                  {columns.map((col, idx) => (
                    <th
                      key={col.key || idx}
                      className={`px-4 py-3 font-semibold uppercase tracking-wider whitespace-nowrap ${
                        col.align === 'left' ? 'text-left' : col.align === 'center' ? 'text-center' : 'text-right'
                      }`}
                      style={{ width: col.width }}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, rIdx) => (
                    <tr key={rIdx}>
                      {columns.map((_, cIdx) => (
                        <td key={cIdx} className="px-4 py-4">
                          <LoadingSkeleton height={18} className="w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center">
                      <EmptyState title={emptyTitle} description={emptyDescription} />
                    </td>
                  </tr>
                ) : (
                  data.map((row, rIdx) => (
                    <tr
                      key={row.id || rIdx}
                      onClick={() => onRowClick && onRowClick(row)}
                      className={`transition-colors ${
                        onRowClick ? 'cursor-pointer hover:bg-white/[0.03]' : 'hover:bg-bg-surface-elevated/40'
                      }`}
                    >
                      {columns.map((col, cIdx) => (
                        <td
                          key={col.key || cIdx}
                          className={`px-4 py-3.5 text-txt-primary whitespace-nowrap ${
                            col.align === 'left' ? 'text-left' : col.align === 'center' ? 'text-center' : 'text-right'
                          }`}
                        >
                          {col.render ? col.render(row) : row[col.accessorKey]}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile View: Condensed Cards (Section 20.4) */}
      {!isError && (
        <div className="block md:hidden space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-2">
                <LoadingSkeleton height={20} className="w-1/2" />
                <LoadingSkeleton height={16} className="w-3/4" />
                <LoadingSkeleton height={16} className="w-1/3" />
              </div>
            ))
          ) : data.length === 0 ? (
            <EmptyState title={emptyTitle} description={emptyDescription} />
          ) : (
            data.map((row, idx) =>
              mobileCardRender ? (
                <div key={row.id || idx}>{mobileCardRender(row)}</div>
              ) : (
                <div
                  key={row.id || idx}
                  className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-2 text-xs"
                >
                  {columns.map((col, cIdx) => (
                    <div key={col.key || cIdx} className="flex items-center justify-between border-b border-border-subtle/50 pb-2 last:border-b-0 last:pb-0">
                      <span className="text-txt-muted font-medium">{col.header}:</span>
                      <span className="text-txt-primary font-semibold">
                        {col.render ? col.render(row) : row[col.accessorKey]}
                      </span>
                    </div>
                  ))}
                </div>
              )
            )
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-bg-surface px-4 py-3 border border-border-default rounded-lg text-xs">
          <div className="text-txt-muted">
            إجمالي النتائج: <span className="font-bold text-txt-primary">{pagination.total || data.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              isDisabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              icon={ChevronRight}
            >
              السابق
            </Button>
            <span className="text-txt-primary font-medium px-2">
              صفحة {pagination.page} من {pagination.totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              isDisabled={pagination.page >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              icon={ChevronLeft}
            >
              التالي
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};