import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBookings } from '../../context/BookingContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { BoardingPass } from '../../components/common/BoardingPass';
import { PageWrapper } from '../../components/common/PageWrapper';
import { formatDateDisplay, formatShortDate, isTripPast } from '../../utils/dateUtils';
import { formatTimeDisplay } from '../../utils/timelineUtils';
import { Clock, MapPin, Hash, Route, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './TripHistoryPage.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
};

export default function TripHistoryPage() {
  const { user } = useAuth();
  const { getMyBookings, cancelBooking } = useBookings();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [passBooking, setPassBooking] = useState(null);

  const allBookings = getMyBookings(user.id);

  const { upcoming, past, completedCount, cancelledCount } = useMemo(() => {
    const up = [], pa = [];
    let comp = 0, canc = 0;
    allBookings.forEach(b => {
      if (b.status === 'CANCELLED') {
        pa.push(b);
        canc++;
        return;
      }
      if (isTripPast(b.date, b.departureTime) || b.status === 'COMPLETED') {
        pa.push(b);
        comp++;
      } else {
        up.push(b);
      }
    });
    up.sort((a, b) => a.date.localeCompare(b.date) || a.departureTime.localeCompare(b.departureTime));
    pa.sort((a, b) => b.date.localeCompare(a.date) || b.departureTime.localeCompare(a.departureTime));
    return { upcoming: up, past: pa, completedCount: comp, cancelledCount: canc };
  }, [allBookings]);

  const displayed = activeTab === 'upcoming' ? upcoming : past;

  const handleCancel = async () => {
    setCancelling(true);
    try {
      cancelBooking(cancelTarget.id);
      addToast('Booking cancelled successfully.', 'info');
      setCancelTarget(null);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <PageWrapper>
      <div className={styles.page}>
        
        {/* Header & Stats Banner */}
        <div className={styles.headerBlock}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>My Trips</h1>
            <p className={styles.pageSub}>View and manage your shuttle bookings</p>
          </div>

          <motion.div 
            className={styles.statsBanner}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.statItem}>
              <span className={styles.statValue}>{upcoming.length}</span>
              <span className={styles.statLabel}>Upcoming</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{completedCount}</span>
              <span className={styles.statLabel}>Completed</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue} style={{ color: 'var(--color-error)' }}>{cancelledCount}</span>
              <span className={styles.statLabel}>Cancelled</span>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div 
          className={styles.tabs} 
          role="tablist"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {['upcoming', 'past'].map(tab => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className={styles.tabCount}>
                {tab === 'upcoming' ? upcoming.length : past.length}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Booking Grid */}
        <AnimatePresence mode="wait">
          {displayed.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                icon={<Route size={32} />}
                title={activeTab === 'upcoming' ? 'No upcoming trips' : 'No past trips'}
                description={activeTab === 'upcoming'
                  ? "You don't have any upcoming bookings. Book a shuttle to get started!"
                  : "Your completed and cancelled trips will appear here."}
                action={activeTab === 'upcoming' && (
                  <Button onClick={() => window.location.href = '/student/book'} size="md">
                    Book a Shuttle
                  </Button>
                )}
              />
            </motion.div>
          ) : (
            <motion.div
              key={`grid-${activeTab}`}
              className={styles.grid}
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence>
                {displayed.map(booking => (
                  <motion.div 
                    key={booking.id} 
                    className={styles.card}
                    variants={itemVariants}
                    layout
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.cardTimeBlock}>
                        <div className={styles.cardTime}>{formatTimeDisplay(booking.departureTime)}</div>
                        <div className={styles.cardDate}>{formatDateDisplay(booking.date)}</div>
                      </div>
                      <Badge>{booking.status}</Badge>
                    </div>

                    <div className={styles.cardInfo}>
                      <div className={styles.cardRoute}>
                        <MapPin size={14} color="var(--color-primary)" />
                        <span>{booking.routeName}</span>
                      </div>
                      <div className={styles.cardMeta}>
                        <span className={styles.metaItem}>
                          <Hash size={14} /> Seat {booking.seatNumber}
                        </span>
                        <span className={styles.metaItem}>
                          <Clock size={14} /> {formatShortDate(booking.date)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardFooter}>
                      {booking.status === 'CONFIRMED' && !isTripPast(booking.date, booking.departureTime) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPassBooking(booking)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <QrCode size={14} /> View Pass
                        </Button>
                      )}
                      <span style={{ flex: 1 }} />
                      {booking.status === 'CONFIRMED' && !isTripPast(booking.date, booking.departureTime) && (
                        <Button
                          variant="cancel"
                          size="sm"
                          onClick={() => setCancelTarget(booking)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Boarding Pass Modal */}
        <Modal
          isOpen={!!passBooking}
          onClose={() => setPassBooking(null)}
          title="Digital Boarding Pass"
          size="sm"
        >
          <BoardingPass booking={passBooking} />
        </Modal>

        {/* Cancel Confirm Modal */}
        <Modal
          isOpen={!!cancelTarget}
          onClose={() => setCancelTarget(null)}
          title="Cancel Booking"
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setCancelTarget(null)} disabled={cancelling}>Keep Booking</Button>
              <Button variant="danger" loading={cancelling} onClick={handleCancel}>Yes, Cancel</Button>
            </>
          }
        >
          <p className={styles.confirmNote}>
            Are you sure you want to cancel your booking for{' '}
            <strong>{cancelTarget?.routeName}</strong> on{' '}
            <strong>{cancelTarget && formatDateDisplay(cancelTarget.date)}</strong> at{' '}
            <strong>{cancelTarget && formatTimeDisplay(cancelTarget.departureTime)}</strong>?
            The seat will be released back to other students.
          </p>
        </Modal>
      </div>
    </PageWrapper>
  );
}
