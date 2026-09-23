import { useState, useCallback, useMemo, useRef } from 'react';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { useDrivers } from '../../hooks/useDrivers';
import { useShifts } from '../../hooks/useShifts';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { DatePicker } from '../../components/common/DatePicker';
import {
  TIMELINE_START_HOUR, TIMELINE_END_HOUR, TIMELINE_HOURS,
  HOUR_COL_WIDTH_PX,
  timeToPixelOffset, shiftWidthPx, getTimelineHours,
  formatTimeDisplay, timeToMinutes
} from '../../utils/timelineUtils';
import { getTodayString, getDayLabel, formatShortDate } from '../../utils/dateUtils';
import { Search, ChevronLeft, ChevronRight, CalendarDays, MoreVertical, Trash2, Clock, Coffee, Play, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './DriverAvailabilityPage.module.css';

const HOURS = getTimelineHours();
const TOTAL_GRID_WIDTH = TIMELINE_HOURS * HOUR_COL_WIDTH_PX;

// ─── Now indicator (current time red line) ────────────────────
function NowIndicator() {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  if (hour < TIMELINE_START_HOUR || hour > TIMELINE_END_HOUR) return null;
  const left = (hour - TIMELINE_START_HOUR) * HOUR_COL_WIDTH_PX;
  return (
    <div className={styles.nowLine} style={{ left }} title={format(now, 'HH:mm')}>
      <div className={styles.nowDot} />
    </div>
  );
}

// ─── Shift Block ──────────────────────────────────────────────
// Matches MoveInSync's block style: coloured with small icon
function ShiftBlock({ shift, onClick }) {
  const left  = timeToPixelOffset(shift.startTime);
  const width = shiftWidthPx(shift.startTime, shift.endTime);
  const minW  = Math.max(width - 3, 16);

  const styles_map = {
    DUTY:  { bg: 'var(--block-duty)',  border: 'var(--block-duty-border)',  text: 'var(--block-duty-text)' },
    BREAK: { bg: 'var(--block-break)', border: 'var(--block-break-border)', text: 'var(--block-break-text)' },
  };
  const s = styles_map[shift.type] || styles_map.DUTY;

  return (
    <div
      className={styles.shiftBlock}
      style={{ left, width: minW, background: s.bg, borderColor: s.border, color: s.text }}
      onClick={e => { e.stopPropagation(); onClick(shift); }}
      title={`${shift.type}: ${shift.startTime} – ${shift.endTime}`}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(shift)}
    >
      {shift.type === 'BREAK'
        ? <Coffee size={10} style={{ flexShrink: 0 }} />
        : <Clock size={10} style={{ flexShrink: 0 }} />}
      {width > 56 && (
        <span className={styles.blockLabel}>
          {shift.startTime}–{shift.endTime}
        </span>
      )}
    </div>
  );
}

// ─── Driver Row Context Menu ──────────────────────────────────
function DriverMenu({ driverId, onAction, anchorRef }) {
  return (
    <div className={styles.contextMenu} role="menu">
      <button role="menuitem" className={styles.menuItem} onClick={() => onAction('startDuty', driverId)}>
        <Play size={13} /> Start Duty
      </button>
      <button role="menuitem" className={styles.menuItem} onClick={() => onAction('endDuty', driverId)}>
        <Square size={13} /> End Duty
      </button>
      <button role="menuitem" className={styles.menuItem} onClick={() => onAction('addBreak', driverId)}>
        <Coffee size={13} /> Add Break
      </button>
    </div>
  );
}

// ─── Shift Modal ──────────────────────────────────────────────
function ShiftModal({ isOpen, onClose, onSave, onDelete, shift, driverId, driverName, date, initialType }) {
  const isEditing = !!shift;
  const [startTime, setStart] = useState(shift?.startTime || '08:00');
  const [endTime,   setEnd]   = useState(shift?.endTime   || '12:00');
  const [type,      setType]  = useState(shift?.type || initialType || 'DUTY');
  const [error,     setError] = useState('');
  const [loading,   setLoad]  = useState(false);

  const handleSave = async () => {
    if (startTime >= endTime) { setError('Start time must be before end time.'); return; }
    setError(''); setLoad(true);
    try { await onSave({ startTime, endTime, type, driverId, date }); onClose(); }
    catch (e) { setError(e.message); }
    finally { setLoad(false); }
  };

  const typeBtn = (t, label, Icon) => (
    <button
      type="button"
      className={`${styles.typeBtn} ${type === t ? styles.typeBtnActive : ''}`}
      style={type === t ? {
        background: t === 'DUTY' ? 'var(--block-duty)' : 'var(--block-break)',
        borderColor: t === 'DUTY' ? 'var(--block-duty-border)' : 'var(--block-break-border)',
        color: t === 'DUTY' ? 'var(--block-duty-text)' : 'var(--block-break-text)',
      } : {}}
      onClick={() => { setType(t); setError(''); }}
    >
      <Icon size={13} /> {label}
    </button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Shift' : 'Add Shift'}
      size="sm"
      footer={
        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
          {isEditing && (
            <Button variant="danger" size="sm" onClick={async () => { await onDelete(shift.id); onClose(); }} loading={loading}>
              <Trash2 size={13} /> Delete
            </Button>
          )}
          <span style={{ flex: 1 }} />
          <Button variant="cancel" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} loading={loading}>{isEditing ? 'Save' : 'Add Shift'}</Button>
        </div>
      }
    >
      <div className={styles.modalContent}>
        <div className={styles.modalDriver}>
          <div className={styles.driverAvatar}>{driverName?.[0]}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 'var(--font-size-base)' }}>{driverName}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{formatShortDate(date)} — {getDayLabel(date)}</div>
          </div>
        </div>
        <div className={styles.typeToggle}>
          {typeBtn('DUTY', 'Duty', Clock)}
          {typeBtn('BREAK', 'Break', Coffee)}
        </div>
        <div className={styles.timeRow}>
          <div className={styles.timeField}>
            <label className={styles.fieldLabel}>Start</label>
            <input type="time" className={styles.timeInput} value={startTime}
              min="06:00" max="22:00" onChange={e => { setStart(e.target.value); setError(''); }} />
          </div>
          <div className={styles.timeSep}>–</div>
          <div className={styles.timeField}>
            <label className={styles.fieldLabel}>End</label>
            <input type="time" className={styles.timeInput} value={endTime}
              min={startTime} max="22:00" onChange={e => { setEnd(e.target.value); setError(''); }} />
          </div>
        </div>
        {error && <div className={styles.formError}>{error}</div>}
      </div>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function DriverAvailabilityPage() {
  const { activeDrivers, drivers, getDriver } = useDrivers();
  const { getShiftsForDate, createShift, updateShift, deleteShift } = useShifts();
  const { addToast } = useToast();

  const [date, setDate] = useState(getTodayString());
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // { shift?, driverId, driverName, initialType? }
  const [openMenu, setOpenMenu] = useState(null); // driverId
  const [selectedDriverId, setSelectedDriverId] = useState(null);

  const dateObj = parseISO(date + 'T00:00:00');
  const shiftsToday = getShiftsForDate(date);

  const filteredDrivers = useMemo(() =>
    activeDrivers.filter(d => d.name.toLowerCase().includes(search.toLowerCase())),
    [activeDrivers, search]
  );

  const displayedDrivers = selectedDriverId 
    ? filteredDrivers.filter(d => d.id === selectedDriverId) 
    : filteredDrivers;

  const getDriverShifts = (driverId) => shiftsToday.filter(s => s.driverId === driverId);

  const handleMenuAction = (action, driverId) => {
    const driver = getDriver(driverId);
    setOpenMenu(null);
    if (action === 'addBreak') {
      setModal({ shift: null, driverId, driverName: driver?.name, initialType: 'BREAK' });
    } else {
      setModal({ shift: null, driverId, driverName: driver?.name, initialType: 'DUTY' });
    }
  };

  const handleSave = (data) => {
    if (modal.shift) {
      updateShift(modal.shift.id, data);
      addToast('Shift updated.', 'success');
    } else {
      createShift(data);
      addToast('Shift added.', 'success');
    }
  };

  const handleDelete = (id) => { deleteShift(id); addToast('Shift removed.', 'info'); };

  const scheduledCount = new Set(shiftsToday.filter(s => s.type === 'DUTY').map(s => s.driverId)).size;

  // Close menu on outside click
  const handlePageClick = () => setOpenMenu(null);

  return (
    <div className={styles.page} onClick={handlePageClick}>
      {/* Page header — matches MoveInSync top bar style */}
      <div className={styles.pageTop}>
        <h2 className={styles.pageTitle}>Driver Management</h2>
        <div className={styles.topRight}>
          <DatePicker 
            value={date} 
            onChange={setDate} 
            align="right"
          />
        </div>
      </div>

      {/* Main panel */}
      <div className={styles.panel}>
        {/* Driver list — left column */}
        <div className={styles.driverPanel}>
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search driver"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.driverList}>
            {filteredDrivers.map(driver => {
              const hasShift = shiftsToday.some(s => s.driverId === driver.id && s.type === 'DUTY');
              const isSelected = selectedDriverId === driver.id;
              const isDimmed = selectedDriverId && !isSelected;
              
              return (
                <div 
                  key={driver.id} 
                  className={`${styles.driverRow} ${isSelected ? styles.driverRowSelected : ''} ${isDimmed ? styles.dimmed : ''}`}
                  onClick={() => setSelectedDriverId(prev => prev === driver.id ? null : driver.id)}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="driverFocus"
                      className={styles.focusHighlight}
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className={styles.driverInfo} style={{ position: 'relative', zIndex: 1 }}>
                    <span className={styles.driverName}>{driver.name}</span>
                    <span className={hasShift ? styles.badgeOnline : styles.badgeOffline}>
                      {hasShift ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div className={styles.menuWrap} style={{ position: 'relative', zIndex: 1 }}>
                    <button
                      className={styles.moreBtn}
                      onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === driver.id ? null : driver.id); }}
                      aria-label="Driver actions"
                    >
                      <MoreVertical size={15} />
                    </button>
                    {openMenu === driver.id && (
                      <DriverMenu driverId={driver.id} onAction={handleMenuAction} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline — right area, horizontally scrollable */}
        <div className={styles.timelineArea}>
          {/* Hour header */}
          <div className={styles.timelineHeader} style={{ width: TOTAL_GRID_WIDTH }}>
            {HOURS.map((h, idx) => (
              <div key={h} className={styles.hourTick} style={{ left: idx * HOUR_COL_WIDTH_PX }}>
                {h}
              </div>
            ))}
          </div>

          {/* Driver tracks */}
          <div className={styles.tracks} style={{ width: TOTAL_GRID_WIDTH }}>
            <NowIndicator />
            {filteredDrivers.map(driver => {
              const isSelected = selectedDriverId === driver.id;
              const isDimmed = selectedDriverId && !isSelected;
              
              return (
                <div
                  key={driver.id}
                  className={`${styles.track} ${isDimmed ? styles.dimmed : ''}`}
                  onClick={() => {
                  const d = getDriver(driver.id);
                  setModal({ shift: null, driverId: driver.id, driverName: d?.name });
                }}
              >
                {HOURS.map((_, idx) => (
                  <div key={idx} className={styles.gridLine} style={{ left: idx * HOUR_COL_WIDTH_PX }} />
                ))}
                {getDriverShifts(driver.id).map(shift => (
                  <ShiftBlock
                    key={shift.id}
                    shift={shift}
                    onClick={s => {
                      const d = getDriver(s.driverId);
                      setModal({ shift: s, driverId: s.driverId, driverName: d?.name });
                    }}
                  />
                ))}
              </div>
            );
          })}
          </div>
        </div>
      </div>

      {/* Legend — matches MoveInSync bottom legend */}
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendBlock} style={{ background: 'var(--block-duty)', borderColor: 'var(--block-duty-border)' }} />
          Duty
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendBlock} style={{ background: 'var(--block-break)', borderColor: 'var(--block-break-border)' }} />
          Break
        </span>
        <span className={styles.legendItem}>
          <span className={styles.nowDotLegend} />
          Current Time
        </span>
      </div>

      {modal && (
        <ShiftModal
          isOpen
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={handleDelete}
          shift={modal.shift}
          driverId={modal.driverId}
          driverName={modal.driverName}
          date={date}
          initialType={modal.initialType}
        />
      )}
    </div>
  );
}
