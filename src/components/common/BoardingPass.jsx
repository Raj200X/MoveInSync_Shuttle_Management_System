import { QRCodeSVG } from 'qrcode.react';
import { Bus, Clock, Hash, Calendar } from 'lucide-react';
import styles from './BoardingPass.module.css';

/**
 * BoardingPass — renders a digital QR shuttle pass for a given booking.
 * QR payload encodes booking ID, route, date, time and seat so it
 * can be scanned by a validator at the shuttle stop.
 */
export function BoardingPass({ booking }) {
  if (!booking) return null;

  const qrPayload = JSON.stringify({
    id: booking.id,
    route: booking.routeName,
    date: booking.date,
    time: booking.departureTime,
    seat: booking.seatNumber,
    passenger: booking.employeeName,
  });

  return (
    <div className={styles.pass}>
      {/* Top strip */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Bus size={18} className={styles.busIcon} />
          <span className={styles.airline}>MoveInSync Campus Shuttle</span>
        </div>
        <span className={styles.passLabel}>BOARDING PASS</span>
      </div>

      {/* Main body */}
      <div className={styles.body}>
        <div className={styles.routeSection}>
          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>ROUTE</span>
            <span className={styles.fieldValue}>{booking.routeName}</span>
          </div>
          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>PASSENGER</span>
            <span className={styles.fieldValue}>{booking.employeeName}</span>
          </div>
        </div>

        <div className={styles.detailsRow}>
          <div className={styles.detailItem}>
            <Calendar size={13} />
            <span className={styles.detailLabel}>DATE</span>
            <span className={styles.detailValue}>{booking.date}</span>
          </div>
          <div className={styles.detailItem}>
            <Clock size={13} />
            <span className={styles.detailLabel}>DEPARTURE</span>
            <span className={styles.detailValue}>{booking.departureTime}</span>
          </div>
          <div className={styles.detailItem}>
            <Hash size={13} />
            <span className={styles.detailLabel}>SEAT</span>
            <span className={styles.detailValue}>{booking.seatNumber}</span>
          </div>
        </div>
      </div>

      {/* Tear line */}
      <div className={styles.tearLine}>
        <div className={styles.circle} />
        <div className={styles.dashes} />
        <div className={styles.circle} />
      </div>

      {/* QR section */}
      <div className={styles.qrSection}>
        <div className={styles.qrWrap}>
          <QRCodeSVG
            value={qrPayload}
            size={120}
            bgColor="transparent"
            fgColor="currentColor"
            level="M"
            includeMargin={false}
          />
        </div>
        <div className={styles.qrMeta}>
          <span className={styles.bookingId}>#{booking.id}</span>
          <span className={styles.scanNote}>Scan at shuttle stop</span>
          <span className={`${styles.statusBadge} ${booking.status === 'CONFIRMED' ? styles.statusConfirmed : styles.statusOther}`}>
            {booking.status}
          </span>
        </div>
      </div>
    </div>
  );
}
