import { useState, useMemo } from 'react';
import { useTablesQuery } from '../hooks/useTables.js';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { useBranchSessionsQuery } from '../hooks/useTableSessions.js';
import { useStartTableSession } from '../hooks/useTableSessions.js';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../shared/components/Button.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { Modal } from '../../../shared/components/Modal.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { EmptyState } from '../../../shared/components/EmptyState.jsx';
import { TableFormModal } from '../components/TableFormModal.jsx';
import { TableDetailDrawer } from '../components/TableDetailDrawer.jsx';
import { TABLE_STATUS_LABELS } from '../schemas/table.schema.js';
import { Grid3x3, Plus, Users, QrCode, KeyRound, Search, Copy, Check } from 'lucide-react';

const statusPill = (status) => {
  const map = {
    AVAILABLE: 'success',
    OCCUPIED: 'danger',
    RESERVED: 'warning',
    MAINTENANCE: 'neutral',
  };
  return map[status] || 'neutral';
};

const STATUS_TABS = [
  { value: 'ALL', label: 'الكل' },
  { value: 'AVAILABLE', label: 'متاحة' },
  { value: 'OCCUPIED', label: 'مشغولة' },
  { value: 'RESERVED', label: 'محجوزة' },
  { value: 'MAINTENANCE', label: 'صيانة' },
];

export const TablesListPage = () => {
  const { activeBranchId, activeBranch } = useBranch();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [newPin, setNewPin] = useState(null);
  const [pinTable, setPinTable] = useState(null);
  const [copied, setCopied] = useState(false);

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
    try {
      const res = await startMutation.mutateAsync(table.id);
      setPinTable(table);
      setNewPin(res.pin);
      setCopied(false);
      queryClient.invalidateQueries({ queryKey: ['table-sessions-branch'] });
    } catch (err) {
      // Session already active — open the drawer so the PIN is visible there.
      if (err?.code === 'BUSINESS_RULE_ERROR') setSelectedTable(table);
    }
  };

  const handleCopyPin = async () => {
    if (!newPin) return;
    try {
      await navigator.clipboard.writeText(newPin);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-5">
      {/* Header + metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <Grid3x3 className="w-5 h-5 text-brand-primary" />
            <span>إدارة الطاولات ورمز QR</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">متابعة صالة المطعم، الأرقام المتاحة والمشغولة، وجلسات الطلب الذاتي.</p>
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-primary text-slate-950 shadow-sm'
                    : 'bg-bg-surface border border-border-default text-txt-muted hover:text-txt-primary'
                }`}
              >
                {tab.label}
                {tab.value !== 'ALL' && (
                  <span className="opacity-70 mr-1 font-mono text-[10px]">({statusCounts[tab.value] || 0})</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-56 shrink-0">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث برقم الطاولة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-surface border border-border-default rounded-lg text-xs py-2 pr-9 pl-3 text-txt-primary placeholder:text-txt-muted focus-visible:outline-none focus-visible:border-brand-primary"
          />
        </div>
      </div>

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
            <div
              key={table.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedTable(table)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setSelectedTable(table);
              }}
              className={`cursor-pointer text-right bg-bg-surface rounded-xl p-3.5 border flex flex-col gap-2.5 transition-all hover:shadow-md active:scale-[0.99] ${
                table.occupied ? 'border-red-500/30 hover:border-red-500/50' : 'border-border-default hover:border-brand-primary/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-txt-primary text-lg leading-none">#{table.label}</span>
                <StatusPill status={statusPill(table.status)}>{TABLE_STATUS_LABELS[table.status] || table.status}</StatusPill>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-txt-muted">
                <Users className="w-3.5 h-3.5" />
                <span>{table.capacity} أفراد</span>
                {table.session && (
                  <span className="mr-auto inline-flex items-center gap-1 text-[10px] font-semibold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                    {table.session.status === 'AWAITING_CONFIRMATION' ? 'بانتظار التأكيد' : `جلسة نشطة (${table.session.members?.length || 0})`}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 pt-1 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={(e) => handleStartSession(e, table)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-bold bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  {table.session ? 'عرض الـ PIN' : 'بدء جلسة'}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTable(table);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-bold bg-bg-base text-txt-muted hover:text-txt-primary border border-border-subtle transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  رمز QR
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TableFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} branchId={activeBranchId} />

      <TableDetailDrawer
        isOpen={Boolean(selectedTable)}
        onClose={() => setSelectedTable(null)}
        table={selectedTable}
        branchName={activeBranch?.name}
      />

      {/* PIN modal */}
      <Modal isOpen={Boolean(newPin)} onClose={() => setNewPin(null)} title={`PIN جلسة الطاولة ${pinTable?.label || ''}`} size="sm">
        <div className="text-center space-y-4 py-2">
          <p className="text-xs text-txt-muted">أعطِ هذا الرمز للعميل عشان يدخل الجلسة من الـ QR:</p>
          <div className="text-4xl font-bold tracking-[0.4em] text-brand-primary font-mono" dir="ltr">{newPin}</div>
          <div className="flex items-center justify-center gap-2">
            <Button size="sm" variant="outline" icon={copied ? Check : Copy} onClick={handleCopyPin}>
              {copied ? 'تم النسخ' : 'نسخ الرمز'}
            </Button>
            <Button size="sm" variant="primary" onClick={() => setNewPin(null)}>تمام</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TablesListPage;