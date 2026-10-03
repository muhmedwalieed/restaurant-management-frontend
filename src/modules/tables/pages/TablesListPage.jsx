import { useState, useMemo } from 'react';
import { useTablesQuery } from '../hooks/useTables.js';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { useBranchSessionsQuery, useStartTableSession } from '../hooks/useTableSessions.js';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../shared/components/Button.jsx';
import { formatTableLabel } from '../utils/tableLabel.js';
import { Modal } from '../../../shared/components/Modal.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { EmptyState } from '../../../shared/components/EmptyState.jsx';
import { TableFormModal } from '../components/TableFormModal.jsx';
import { TableDetailDrawer } from '../components/TableDetailDrawer.jsx';
import { TableGridCard } from '../components/list/TableGridCard.jsx';
import { TablesFilterToolbar } from '../components/list/TablesFilterToolbar.jsx';
import { Grid3x3, Plus, Copy, Store } from 'lucide-react';

export const TablesListPage = () => {
  const { activeBranchId, activeBranch } = useBranch();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [newPin, setNewPin] = useState(null);
  const [pinTable, setPinTable] = useState(null);
  const [copiedTableId, setCopiedTableId] = useState(null);

  const { data: tablesResponse, isLoading, isError, error, refetch } = useTablesQuery(activeBranchId, {
    page: 1,
    limit: 100,
  });
  const { data: sessions } = useBranchSessionsQuery(true);
  const startMutation = useStartTableSession();

  const tablesList = useMemo(() => tablesResponse?.items || [], [tablesResponse]);
  const sessionsByTable = useMemo(() => {
    const map = new Map();
    for (const s of sessions || []) map.set(s.tableId, s);
    return map;
  }, [sessions]);

  const withSession = useMemo(
    () =>
      tablesList.map((t) => ({
        ...t,
        session: sessionsByTable.get(t.id) || null,
        occupied: Boolean(sessionsByTable.get(t.id)) || t.status === 'OCCUPIED',
      })),
    [tablesList, sessionsByTable]
  );

  const filteredTables = useMemo(() => {
    return withSession.filter((t) => {
      const matchesSearch =
        !searchQuery.trim() || t.label?.toLowerCase().includes(searchQuery.toLowerCase());
      let matchesStatus = true;
      if (statusFilter === 'ALL') matchesStatus = true;
      else if (statusFilter === 'AVAILABLE') matchesStatus = !t.occupied;
      else if (statusFilter === 'OCCUPIED') matchesStatus = t.occupied;
      else matchesStatus = t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [withSession, searchQuery, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = { AVAILABLE: 0, OCCUPIED: 0, RESERVED: 0, MAINTENANCE: 0 };
    for (const t of withSession) {
      if (t.occupied) counts.OCCUPIED += 1;
      else if (t.status === 'AVAILABLE') counts.AVAILABLE += 1;
      else if (t.status === 'RESERVED') counts.RESERVED += 1;
      else counts.MAINTENANCE += 1;
    }
    return counts;
  }, [withSession]);

  const handleStartSession = async (e, table) => {
    e.stopPropagation();
    if (table.session) {
      setSelectedTable(table);
      return;
    }
    try {
      const res = await startMutation.mutateAsync(table.id);
      setPinTable(table);
      setNewPin(res.pin);
      queryClient.invalidateQueries({ queryKey: ['branch-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['tables', activeBranchId] });
    } catch {
      /* ignore */
    }
  };

  const handleCopyQr = async (e, table) => {
    e.stopPropagation();
    if (!table.qrUrl) return;
    try {
      await navigator.clipboard.writeText(table.qrUrl);
      setCopiedTableId(table.id);
      setTimeout(() => setCopiedTableId(null), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border-default/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0">
            <Grid3x3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-txt-primary leading-tight">
              إدارة الطاولات ورمز QR
            </h1>
            <div className="flex items-center gap-2 text-xs text-txt-muted mt-0.5">
              <span className="flex items-center gap-1 font-medium text-slate-300">
                <Store className="w-3.5 h-3.5 text-brand-primary" />
                {activeBranch?.name || 'جميع الفروع'}
              </span>
              <span>•</span>
              <span>إجمالي الطاولات المسجلة ({tablesList.length})</span>
            </div>
          </div>
        </div>

        <PermissionGate permission="tables.manage">
          <Button
            size="sm"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-slate-950 font-medium hover:bg-slate-200 border-none shadow-sm text-xs"
          >
            إضافة طاولة جديدة
          </Button>
        </PermissionGate>
      </div>

      {/* Controls + filter tabs */}
      <TablesFilterToolbar
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusCounts={statusCounts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Table grid */}
      {!activeBranchId ? (
        <EmptyState title="لا يوجد فرع نشط" description="اختر فرعًا من القائمة لعرض الطاولات." icon={Grid3x3} />
      ) : isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
          {[...Array(8)].map((_, i) => (
            <LoadingSkeleton key={i} height={150} className="rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState title="تعذر تحميل الطاولات" description={error?.message || ''} icon={Grid3x3} onAction={refetch} actionLabel="إعادة المحاولة" />
      ) : filteredTables.length === 0 ? (
        <EmptyState
          title="لا توجد طاولات مطابقة"
          description="ضيف طاولة جديدة أو غيّر الفلترة."
          icon={Grid3x3}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
          {filteredTables.map((table) => (
            <TableGridCard
              key={table.id}
              table={table}
              onSelect={setSelectedTable}
              onStartSession={handleStartSession}
              onCopyQr={handleCopyQr}
              copiedTableId={copiedTableId}
            />
          ))}
        </div>
      )}

      {/* Modals & Drawers */}
      <TableFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        branchId={activeBranchId}
      />

      <TableDetailDrawer
        table={selectedTable}
        isOpen={Boolean(selectedTable)}
        onClose={() => setSelectedTable(null)}
      />

      <Modal
        isOpen={Boolean(newPin)}
        onClose={() => setNewPin(null)}
        title={`بدء جلسة - ${formatTableLabel(pinTable?.label)}`}
        size="sm"
      >
        <div className="text-center space-y-4 py-2">
          <p className="text-xs text-txt-muted">أعطِ هذا الرمز للعميل للطلب من هاتفه عبر QR:</p>
          <div className="text-4xl font-bold tracking-widest text-brand-primary font-mono py-2 bg-bg-base/60 rounded-xl border border-brand-primary/20">
            {newPin}
          </div>
          <div className="flex gap-2 justify-center">
            <Button
              size="sm"
              variant="outline"
              icon={Copy}
              onClick={() => navigator.clipboard.writeText(newPin || '')}
            >
              نسخ الـ PIN
            </Button>
            <Button size="sm" variant="primary" onClick={() => setNewPin(null)}>
              حسناً
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};