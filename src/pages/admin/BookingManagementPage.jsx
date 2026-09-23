import { useState, useMemo } from 'react';
import { useBookings } from '../../context/BookingContext';
import { useRoutes } from '../../hooks/useRoutes';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { DatePicker } from '../../components/common/DatePicker';
import { SkeletonRow } from '../../components/common/Skeleton';
import { formatDateDisplay, formatShortDate } from '../../utils/dateUtils';
import { formatTimeDisplay } from '../../utils/timelineUtils';
import { getTodayString } from '../../utils/dateUtils';
import { Search, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Bus, Phone, Star, CalendarDays } from 'lucide-react';
import styles from './BookingManagementPage.module.css';

// MoveInSync status badge — exact color mapping from the screenshot
function StatusBadge({ status }) {
  const MAP = {
    ACCEPTED:  { label: 'Accepted',  cls: styles.sAccepted },
    WAITING:   { label: 'Waiting',   cls: styles.sWaiting },
    NO_SHOW:   { label: 'No Show',   cls: styles.sNoShow },
    DECLINED:  { label: 'Declined',  cls: styles.sDeclined },
    COMPLETED: { label: 'Completed', cls: styles.sCompleted },
    REQUESTED: { label: 'Requested', cls: styles.sRequested },
    ON_GOING:  { label: 'On Going',  cls: styles.sOngoing },
    CANCELLED: { label: 'Cancelled', cls: styles.sCancelled },
    DROPPED:   { label: 'Dropped',   cls: styles.sDropped },
    CONFIRMED: { label: 'Accepted',  cls: styles.sAccepted },
  };
  const s = MAP[status] || MAP.REQUESTED;
  return <span className={`${styles.statusBadge} ${s.cls}`}>{s.label}</span>;
}

// Sort icon for table columns (matches MoveInSync's ⇅ arrows)
function SortIcon({ field, sortBy, sortDir }) {
  return (
    <span className={styles.sortIcon}>
      <span style={{ opacity: sortBy === field && sortDir === 'asc' ? 1 : 0.3 }}>↑</span>
      <span style={{ opacity: sortBy === field && sortDir === 'desc' ? 1 : 0.3 }}>↓</span>
    </span>
  );
}

// Booking detail panel (slides in from right — matches MoveInSync)
function BookingDetailPanel({ booking, routes, onClose, onCancel }) {
  if (!booking) return null;
  const routeObj = routes.find(r => r.id === booking.routeId);
  const startStop = routeObj ? [...routeObj.stops].sort((a,b) => a.order - b.order)[0]?.name : (booking.routeName?.split(' ')[0] || 'Origin');
  const endStop = routeObj ? [...routeObj.stops].sort((a,b) => a.order - b.order).pop()?.name : 'Destination';

  return (
    <Modal
      isOpen={!!booking}
      onClose={onClose}
      title={`Booking ID: ${booking.id.slice(-6).toUpperCase()}`}
      size="md"
      footer={
        <>
            <Button variant="cancel" size="sm" onClick={onCancel}>
              Cancel Booking ⊘
            </Button>
          <Button size="sm">Edit ✎</Button>
        </>
      }
    >
      <div className={styles.detailBody}>
        <div className={styles.detailEmployee}>
          <div className={styles.detailName}>{booking.employeeName || 'Student'}</div>
          <StatusBadge status={booking.status} />
        </div>
        <div className={styles.detailMeta}>
          Emp ID: {booking.id.slice(-6).toUpperCase()}
        </div>
        <div className={styles.detailMeta}>
          Sign In: — &nbsp;&nbsp; {formatShortDate(booking.date)}
        </div>

        <div className={styles.detailDivider} />

        <div className={styles.vehicleBlock}>
          <div className={styles.vehicleIcon}><Bus size={20} /></div>
          <div>
            <div className={styles.vehicleName}>NB-002-RF</div>
            <div className={styles.vehicleSub}>UA3282 · White Bus · <span>👥 12</span></div>
          </div>
        </div>

        <div className={styles.journeyBlock}>
          <div className={styles.journeyStop}>
            <div className={styles.stopDot} />
            <div>
              <div className={styles.stopName}>{startStop}</div>
              <div className={styles.stopTime}>
                Requested Pickup Time: {formatTimeDisplay(booking.departureTime)}
              </div>
            </div>
          </div>
          <div className={styles.journeyLine} />
          <div className={styles.journeyStop}>
            <div className={styles.stopDotEnd} />
            <div>
              <div className={styles.stopName}>{endStop}</div>
              <div className={styles.stopTime}>Planned Drop: —</div>
            </div>
          </div>
        </div>

        <div className={styles.driverBlock}>
          <div className={styles.driverAvatar}>S</div>
          <div className={styles.driverInfo}>
            <span className={styles.driverName}>Steve Smith</span>
            <span className={styles.driverPhone}><Phone size={11} /> +1-323-493-3293</span>
          </div>
          <div className={styles.rating}><Star size={12} fill="currentColor" /> 4.5</div>
        </div>

        <div className={styles.detailDivider} />

        <div className={styles.detailActions}>
          <button className={styles.actionLink}>→ Sign in rider</button>
          <button className={`${styles.actionLink} ${styles.actionDanger}`}>⊘ Mark rider as No-show</button>
        </div>
      </div>
    </Modal>
  );
}

const PAGE_SIZE = 10;

export default function BookingManagementPage() {
  const { getAllBookings, cancelBooking } = useBookings();
  const { routes } = useRoutes();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('bookedAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const allBookings = getAllBookings();

  const filtered = useMemo(() => {
    let data = allBookings
      .filter(b => !filterDate || b.date === filterDate)
      .filter(b => !filterStatus || b.status === filterStatus)
      .filter(b => !search || b.routeName?.toLowerCase().includes(search.toLowerCase()) || b.id.includes(search));

    data.sort((a, b) => {
      let av = a[sortBy] || '', bv = b[sortBy] || '';
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return data;
  }, [allBookings, filterDate, filterStatus, search, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('asc'); }
  };

  const clearFilters = () => { setFilterDate(''); setFilterStatus(''); setSearch(''); setPage(1); };
  const hasFilters = filterDate || filterStatus || search;

  const handleCancel = () => {
    if (!selectedBooking) return;
    cancelBooking(selectedBooking.id);
    addToast('Booking cancelled.', 'info');
    setSelectedBooking(null);
  };

  const colHead = (label, field) => (
    <th className={styles.th} onClick={() => toggleSort(field)} style={{ cursor: 'pointer' }}>
      <span className={styles.thInner}>
        {label}
        <SortIcon field={field} sortBy={sortBy} sortDir={sortDir} />
      </span>
    </th>
  );

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageTop}>
        <h2 className={styles.pageTitle}>Booking Management</h2>
        <div className={styles.topControls}>
          <div className={styles.searchWrap}>
            <Search size={13} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search Emp, ID, Booking ID"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <DatePicker 
            value={filterDate} 
            onChange={v => { setFilterDate(v); setPage(1); }} 
            placeholder="All Dates"
            align="right"
          />
          {hasFilters && (
            <button className={styles.clearBtn} onClick={clearFilters}><X size={12} /> Clear</button>
          )}
        </div>
      </div>

      {/* Table + Detail panel */}
      <div className={`${styles.content} ${selectedBooking ? styles.withPanel : ''}`}>
        {/* Table */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {colHead('Booking ID', 'id')}
                <th className={styles.th}>Employee</th>
                {colHead('Status', 'status')}
                {colHead('From', 'routeName')}
                <th className={styles.th}>To</th>
                <th className={styles.th}>Vehicle</th>
                {colHead('Requested\nPickup Time', 'departureTime')}
                <th className={styles.th}>Pickup\nTime</th>
                <th className={styles.th}>Planned Drop</th>
                <th className={styles.th}>Actual Drop</th>
                <th className={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={11}>
                  <EmptyState
                    title="No bookings found"
                    description={hasFilters ? 'No bookings match your filters.' : 'No bookings yet.'}
                    action={hasFilters && <Button variant="secondary" size="sm" onClick={clearFilters}>Clear Filters</Button>}
                  />
                </td></tr>
              ) : paginated.map(b => {
                const routeObj = routes.find(r => r.id === b.routeId);
                const startStop = routeObj ? [...routeObj.stops].sort((x,y) => x.order - y.order)[0]?.name : (b.routeName?.split(' ')[0] || 'Origin');
                const endStop = routeObj ? [...routeObj.stops].sort((x,y) => x.order - y.order).pop()?.name : 'Destination';

                return (
                  <tr
                    key={b.id}
                    className={`${styles.row} ${selectedBooking?.id === b.id ? styles.rowSelected : ''}`}
                    onClick={() => setSelectedBooking(b)}
                  >
                    <td className={styles.td}><span className={styles.bookingId}>{b.id.slice(-6).toUpperCase()}</span></td>
                    <td className={styles.td}>{b.employeeName || 'Unknown'}</td>
                    <td className={styles.td}><StatusBadge status={b.status} /></td>
                    <td className={styles.td}>{startStop}</td>
                    <td className={styles.td}>{endStop}</td>
                    <td className={styles.td}>{b.vehicleNo || 'MH-12 AB-1234'}</td>
                    <td className={styles.td}>{formatTimeDisplay(b.departureTime)}</td>
                    <td className={styles.td}>{formatTimeDisplay(b.pickupTime)}</td>
                    <td className={styles.td}>{formatTimeDisplay(b.plannedDropTime)}</td>
                    <td className={styles.td}>{formatTimeDisplay(b.actualDropTime)}</td>
                    <td className={styles.td}>
                      <button className={styles.viewBtn} onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }}>
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination — matches MoveInSync exactly */}
          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>
              Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} items
            </span>
            <div className={styles.paginationControls}>
              <button className={styles.pgBtn} onClick={() => setPage(1)} disabled={page === 1}><ChevronsLeft size={13} /></button>
              <button className={styles.pgBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={13} /></button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                if (p < 1 || p > totalPages) return null;
                return (
                  <button
                    key={p}
                    className={`${styles.pgBtn} ${p === page ? styles.pgActive : ''}`}
                    onClick={() => setPage(p)}
                  >{p}</button>
                );
              })}
              {totalPages > 5 && <span className={styles.pgEllipsis}>…</span>}
              {totalPages > 5 && (
                <button className={styles.pgBtn} onClick={() => setPage(totalPages)}>{totalPages}</button>
              )}
              <button className={styles.pgBtn} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={13} /></button>
              <button className={styles.pgBtn} onClick={() => setPage(totalPages)} disabled={page === totalPages}><ChevronsRight size={13} /></button>
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {selectedBooking && (
          <BookingDetailPanel
            booking={selectedBooking}
            routes={routes}
            onClose={() => setSelectedBooking(null)}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
