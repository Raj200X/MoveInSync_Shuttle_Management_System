import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBookings } from '../../context/BookingContext';
import { useDrivers } from '../../hooks/useDrivers';
import { useShifts } from '../../hooks/useShifts';
import { useRoutes } from '../../hooks/useRoutes';
import { getTodayString } from '../../utils/dateUtils';
import { format, subDays, parseISO } from 'date-fns';
import { BookOpen, Users, Route, TrendingUp, Calendar, Bus } from 'lucide-react';
import { DatePicker } from '../../components/common/DatePicker';
import styles from './DashboardPage.module.css';

function KPICard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className={styles.kpiCard}>
      <div className={styles.kpiIcon} style={{ background: color + '22', color }}><Icon size={20} /></div>
      <div className={styles.kpiBody}>
        <div className={styles.kpiValue}>{value}</div>
        <div className={styles.kpiLabel}>{label}</div>
        {sub && <div className={styles.kpiSub}>{sub}</div>}
      </div>
    </div>
  );
}

function BookingBarChart({ data }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className={styles.chart}>
      {data.map(d => (
        <div key={d.label} className={styles.barGroup}>
          <div className={styles.barWrap}>
            <div
              className={styles.bar}
              style={{ height: `${Math.round((d.count / max) * 100)}%` }}
              title={`${d.count} bookings`}
            >
              {d.count > 0 && <span className={styles.barTip}>{d.count}</span>}
            </div>
          </div>
          <div className={styles.barLabel}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { getAllBookings } = useBookings();
  const { activeDrivers } = useDrivers();
  const { getShiftsForDate } = useShifts();
  const { activeRoutes } = useRoutes();

  const [dashboardDate, setDashboardDate] = useState(getTodayString());
  const allBookings = getAllBookings();
  const shiftsToday = getShiftsForDate(dashboardDate);

  const todayBookings = allBookings.filter(b => b.date === dashboardDate && b.status === 'CONFIRMED').length;
  const scheduledDrivers = new Set(shiftsToday.filter(s => s.type === 'DUTY').map(s => s.driverId)).size;
  const utilisationPct = activeDrivers.length > 0 ? Math.round((scheduledDrivers / activeDrivers.length) * 100) : 0;

  // Booking trend: last 7 days
  const trend = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
      const label = format(subDays(new Date(), 6 - i), 'EEE');
      const count = allBookings.filter(b => b.date === d && b.status !== 'CANCELLED').length;
      return { label, count, date: d };
    });
  }, [allBookings]);

  // Recent bookings
  const recent = allBookings
    .filter(b => b.status === 'CONFIRMED')
    .sort((a, b) => b.bookedAt.localeCompare(a.bookedAt))
    .slice(0, 5);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard Overview</h1>
          <p className={styles.pageSub}>Monitor and manage campus shuttle operations.</p>
        </div>
        <div className={styles.topRight}>
          <DatePicker 
            value={dashboardDate}
            onChange={setDashboardDate}
            align="right"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <KPICard label="Today's Bookings" value={todayBookings} icon={BookOpen} color="#2563EB" sub="Confirmed seats" />
        <KPICard label="Active Drivers" value={activeDrivers.length} icon={Users} color="#16A34A" sub={`${scheduledDrivers} scheduled today`} />
        <KPICard label="Active Routes" value={activeRoutes.length} icon={Route} color="#0891B2" sub="Operational" />
        <KPICard label="Driver Utilisation" value={`${utilisationPct}%`} icon={TrendingUp} color="#D97706" sub={`${scheduledDrivers}/${activeDrivers.length} drivers`} />
      </div>

      <div className={styles.bottomGrid}>
        {/* Booking trend chart */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Booking Trend</h2>
            <span className={styles.cardSub}>Last 7 days</span>
          </div>
          <BookingBarChart data={trend} />
        </div>

        {/* Recent bookings */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Recent Bookings</h2>
            <span className={styles.cardSub}>Latest confirmed</span>
          </div>
          {recent.length === 0 ? (
            <div className={styles.emptyMsg}>No bookings yet</div>
          ) : (
            <div className={styles.recentList}>
              {recent.map(b => (
                <div key={b.id} className={styles.recentItem}>
                  <div className={styles.recentIcon}><Bus size={14} /></div>
                  <div className={styles.recentInfo}>
                    <div className={styles.recentRoute}>{b.routeName}</div>
                    <div className={styles.recentMeta}>{b.date} at {b.departureTime}</div>
                  </div>
                  <div className={styles.recentSeat}>Seat {b.seatNumber}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
