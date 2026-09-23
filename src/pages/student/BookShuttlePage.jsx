import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRoutes } from '../../hooks/useRoutes';
import { useTrips } from '../../hooks/useTrips';
import { useBookings } from '../../context/BookingContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/Skeleton';
import { DatePicker } from '../../components/common/DatePicker';
import { BoardingPass } from '../../components/common/BoardingPass';
import { LiveTracking } from '../../components/common/LiveTracking';
import { getTodayString, formatDateDisplay, formatShortDate } from '../../utils/dateUtils';
import { formatTimeDisplay } from '../../utils/timelineUtils';
import { Bus, MapPin, Clock, Users, ChevronRight, Search, QrCode, Map, HeadphonesIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './BookShuttlePage.module.css';

export default function BookShuttlePage() {
  const { user } = useAuth();
  const { activeRoutes } = useRoutes();
  const { getTripsForRoute } = useTrips();
  const { createBooking, getMyBookings } = useBookings();
  const { addToast } = useToast();

  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [searched, setSearched] = useState(false);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmTrip, setConfirmTrip] = useState(null);
  const [booking, setBooking] = useState(false);
  const [passOpen, setPassOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const resultsRef = useRef(null);

  const selectedRouteObj = activeRoutes.find(r => r.id === selectedRoute);

  // Find next upcoming trip for Hero Section
  const myBookings = getMyBookings(user.id).filter(b => b.status === 'CONFIRMED' || b.status === 'ACCEPTED');
  const nextTrip = myBookings.length > 0 ? myBookings.sort((a,b) => new Date(a.date) - new Date(b.date))[0] : null;
  const nextTripRoute = nextTrip ? activeRoutes.find(r => r.id === nextTrip.routeId) : null;
  const nextTripDestination = nextTripRoute ? [...nextTripRoute.stops].sort((a,b) => a.order - b.order).pop()?.name : 'Destination';

  const handleSearch = () => {
    if (!selectedRoute || !selectedDate) {
      addToast('Please select a route and date.', 'warning');
      return;
    }
    setLoading(true);
    setSearched(true);
    
    // Simulate async fetch
    setTimeout(() => {
      setTrips(getTripsForRoute(selectedRoute, selectedDate));
      setLoading(false);
      
      // Automatically scroll down to the results section after they load
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }, 400);
  };

  const handleBookConfirm = async () => {
    setBooking(true);
    try {
      createBooking(user.id, confirmTrip, selectedRouteObj);
      addToast('Booking confirmed! Have a safe trip 🚌', 'success');
      setConfirmTrip(null);
      // Refresh trips
      setTrips(getTripsForRoute(selectedRoute, selectedDate));
    } catch (err) {
      addToast(err.message || 'Booking failed', 'error');
    } finally {
      setBooking(false);
    }
  };

  const occupancyPercent = (trip) => Math.round(((trip.totalSeats - trip.availableSeats) / trip.totalSeats) * 100);
  const occupancyColor = (trip) => {
    const p = occupancyPercent(trip);
    if (p >= 85) return 'var(--color-error)';
    if (p >= 60) return 'var(--color-warning)';
    return 'var(--color-success)';
  };

  // Animation variants
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  const itemVars = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className={styles.page}
      variants={containerVars}
      initial="hidden"
      animate="show"
    >
      {/* 1. Hero Section */}
      <motion.div className={styles.hero} variants={itemVars}>
        <div className={styles.heroPattern} />
        <div className={styles.heroContent}>
          <h1 className={styles.greeting}>Good Morning, {user?.name?.split(' ')[0] || 'Student'}</h1>
          <p className={styles.subtitle}>Where are we heading today?</p>
        </div>

        {nextTrip && (
          <div className={styles.nextTripCard}>
            <div className={styles.nextTripHeader}>
              <span className={styles.nextTripTitle}>Upcoming Ride</span>
              <Badge variant="info">Confirmed</Badge>
            </div>
            <div className={styles.nextTripRoute}>
              <div className={styles.routeIcon}><Bus size={18} color="white" /></div>
              <div className={styles.routeInfo}>
                <h3>{nextTrip.routeName?.split(' ')[0] || 'Campus'}</h3>
                <p>To {nextTripDestination}</p>
              </div>
            </div>
            <div className={styles.nextTripDetails}>
              <div className={styles.detailBlock}>
                <span className={styles.detailLabel}>Time</span>
                <span className={styles.detailValue}>{formatTimeDisplay(nextTrip.departureTime)}</span>
              </div>
              <div className={styles.detailBlock}>
                <span className={styles.detailLabel}>Date</span>
                <span className={styles.detailValue}>{formatShortDate(nextTrip.date)}</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* 2. Quick Actions */}
      <motion.div className={styles.quickActions} variants={itemVars}>
        <button
          className={styles.actionBtn}
          onClick={() => nextTrip && setPassOpen(true)}
          style={{ opacity: nextTrip ? 1 : 0.45, cursor: nextTrip ? 'pointer' : 'not-allowed' }}
          title={nextTrip ? 'View your upcoming boarding pass' : 'No upcoming trips'}
        >
          <div className={styles.actionIconWrap}><QrCode size={18} /></div>
          Boarding Pass
        </button>
        <button
          className={styles.actionBtn}
          onClick={() => nextTrip && setTrackOpen(true)}
          style={{ opacity: nextTrip ? 1 : 0.45, cursor: nextTrip ? 'pointer' : 'not-allowed' }}
          title={nextTrip ? 'Track your shuttle live' : 'No upcoming trips'}
        >
          <div className={styles.actionIconWrap}><Map size={18} /></div>
          Live Tracking
        </button>
        <button className={styles.actionBtn}>
          <div className={styles.actionIconWrap}><HeadphonesIcon size={18} /></div>
          Support
        </button>
      </motion.div>

      {/* 3. Booking Widget */}
      <motion.div className={styles.bookingSection} variants={itemVars}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Book a Shuttle</h2>
          <p className={styles.sectionSub}>Search available shuttles by route and date</p>
        </div>

        <div className={styles.searchWidget}>
          <div className={styles.searchFields}>
            <div className={styles.field}>
              <label htmlFor="route-select" className={styles.label}>
                <MapPin size={16} /> Route
              </label>
              <select
                id="route-select"
                className={styles.select}
                value={selectedRoute}
                onChange={e => { setSelectedRoute(e.target.value); setSearched(false); }}
              >
                <option value="">Select a route…</option>
                {activeRoutes.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                <Clock size={16} /> Date
              </label>
              <DatePicker 
                value={selectedDate} 
                onChange={v => { setSelectedDate(v); setSearched(false); }}
                align="left"
                className={styles.dateInput}
              />
            </div>

            <Button
              onClick={handleSearch}
              size="lg"
              className={styles.searchBtn}
              icon={<Search size={18} />}
              disabled={!selectedRoute || !selectedDate}
            >
              Search
            </Button>
          </div>

          {/* Route stops preview */}
          {selectedRouteObj && (
            <motion.div 
              className={styles.stopsPreview}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              {selectedRouteObj.stops
                .sort((a, b) => a.order - b.order)
                .map((stop, idx, arr) => (
                  <span key={stop.id} className={styles.stopItem}>
                    <span className={styles.stopDot} />
                    {stop.name}
                    {idx < arr.length - 1 && <ChevronRight size={14} className={styles.stopArrow} />}
                  </span>
                ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* 4. Results */}
      {searched && (
        <motion.div 
          ref={resultsRef}
          className={styles.results}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>
              Available Shuttles
              <span className={styles.dateLabel}> — {formatDateDisplay(selectedDate)}</span>
            </h2>
            {!loading && trips.length > 0 && (
              <span className={styles.resultCount}>{trips.length} found</span>
            )}
          </div>

          {loading ? (
            <div className={styles.grid}>
              {[1,2,3].map(i => <SkeletonCard key={i} lines={4} />)}
            </div>
          ) : trips.length === 0 ? (
            <EmptyState
              icon={<Bus size={32} />}
              title="No shuttles available"
              description={`No available shuttles for ${formatDateDisplay(selectedDate)} on this route. Try a different date or route.`}
            />
          ) : (
            <motion.div 
              className={styles.grid}
              variants={containerVars}
              initial="hidden"
              animate="show"
            >
              {trips.map(trip => {
                const route = activeRoutes.find(r => r.id === trip.routeId);
                return (
                  <motion.div key={trip.id} className={styles.tripCard} variants={itemVars}>
                    <div className={styles.tripHeader}>
                      <div className={styles.tripTime}>
                        {formatTimeDisplay(trip.departureTime)}
                      </div>
                      <Badge variant="info">Scheduled</Badge>
                    </div>

                    <div className={styles.tripMeta}>
                      <div className={styles.metaItem}>
                        <MapPin size={14} />
                        <span>{selectedRouteObj?.name}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <Clock size={14} />
                        <span>~{route?.estimatedDurationMins || 20} min</span>
                      </div>
                    </div>

                    {/* Occupancy bar */}
                    <div className={styles.occupancy}>
                      <div className={styles.occupancyBar}>
                        <div
                          className={styles.occupancyFill}
                          style={{
                            width: `${occupancyPercent(trip)}%`,
                            background: occupancyColor(trip),
                          }}
                        />
                      </div>
                      <div className={styles.occupancyLabel}>
                        <span style={{ color: occupancyColor(trip) }}>
                          {trip.availableSeats} seats left
                        </span>
                        <span className={styles.totalSeats}>/ {trip.totalSeats}</span>
                      </div>
                    </div>

                    <Button
                      fullWidth
                      size="sm"
                      onClick={() => setConfirmTrip(trip)}
                      disabled={trip.availableSeats === 0}
                    >
                      {trip.availableSeats === 0 ? 'Fully Booked' : 'Book Seat'}
                    </Button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Confirm Booking Modal */}
      <Modal
        isOpen={!!confirmTrip}
        onClose={() => setConfirmTrip(null)}
        title="Confirm Booking"
        footer={
          <>
            <Button variant="cancel" onClick={() => setConfirmTrip(null)} disabled={booking}>Cancel</Button>
            <Button onClick={handleBookConfirm} loading={booking}>Confirm Booking</Button>
          </>
        }
      >
        {confirmTrip && (
          <div className={styles.confirmBody}>
            <div className={styles.confirmRow}>
              <span className={styles.confirmLabel}>Route</span>
              <span className={styles.confirmValue}>{selectedRouteObj?.name}</span>
            </div>
            <div className={styles.confirmRow}>
              <span className={styles.confirmLabel}>Date</span>
              <span className={styles.confirmValue}>{formatShortDate(selectedDate)}</span>
            </div>
            <div className={styles.confirmRow}>
              <span className={styles.confirmLabel}>Departure</span>
              <span className={styles.confirmValue}>{formatTimeDisplay(confirmTrip.departureTime)}</span>
            </div>
            <div className={styles.confirmRow}>
              <span className={styles.confirmLabel}>Seats Available</span>
              <span className={styles.confirmValue}>{confirmTrip.availableSeats}</span>
            </div>
            <div className={styles.confirmNote}>
              A seat will be reserved for you. You can cancel from Trip History if needed.
            </div>
          </div>
        )}
      </Modal>

      {/* Boarding Pass Modal — shows the next upcoming trip's QR pass */}
      <Modal
        isOpen={passOpen}
        onClose={() => setPassOpen(false)}
        title="Digital Boarding Pass"
        size="sm"
      >
        <BoardingPass booking={nextTrip} />
      </Modal>

      {/* Live Tracking Modal */}
      <Modal
        isOpen={trackOpen}
        onClose={() => setTrackOpen(false)}
        title="Live Shuttle Tracking"
        size="md"
      >
        <LiveTracking route={nextTripRoute} booking={nextTrip} />
      </Modal>
    </motion.div>
  );
}
