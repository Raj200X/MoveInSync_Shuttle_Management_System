import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, MapPin, Clock, Radio, ChevronRight } from 'lucide-react';
import styles from './LiveTracking.module.css';

/**
 * LiveTracking — mock live shuttle tracker.
 *
 * Renders a custom SVG route map with:
 *  - Animated bus marker that moves between stops in real time
 *  - ETA countdown per stop
 *  - "LIVE" pulse indicator
 *  - Stop timeline with current position highlighted
 *
 * No external map API required — pure SVG + framer-motion.
 *
 * @param {Object} route    - Route object from useRoutes
 * @param {Object} booking  - The student's booking for this route
 */
export function LiveTracking({ route, booking }) {
  // ── Stop layout ──────────────────────────────────────────────
  // Map each stop to an (x, y) coordinate on a 440×220 SVG canvas.
  // Positions are spread evenly along a gentle S-curve path.
  const stops = useMemo(() => {
    if (!route?.stops) return [];
    const sorted = [...route.stops].sort((a, b) => a.order - b.order);
    const n = sorted.length;
    return sorted.map((stop, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const x = 40 + t * 360;
      // gentle sine curve for visual interest
      const y = 110 + Math.sin(t * Math.PI) * -50 + (i % 2 === 0 ? 10 : -10);
      return { ...stop, x, y };
    });
  }, [route]);

  // ── Animated bus position ─────────────────────────────────────
  // busPos is a value from 0..(stops.length-1), advanced every 3s
  const DWELL_SECS = 3;   // seconds spent "at" each stop
  const TRAVEL_SECS = 6;  // seconds between stops

  const [phase, setPhase] = useState('travel'); // 'travel' | 'dwell'
  const [segIdx, setSegIdx] = useState(0);      // current segment (0 = between stop 0→1)
  const [progress, setProgress] = useState(0);  // 0..1 within segment
  const [etaSecs, setEtaSecs] = useState(TRAVEL_SECS);
  const rafRef = useRef(null);
  const startRef = useRef(Date.now());

  useEffect(() => {
    if (stops.length < 2) return;

    let seg = 0;
    let currentPhase = 'travel';
    let phaseStart = Date.now();

    const tick = () => {
      const elapsed = (Date.now() - phaseStart) / 1000;
      const duration = currentPhase === 'travel' ? TRAVEL_SECS : DWELL_SECS;
      const pct = Math.min(elapsed / duration, 1);

      setProgress(pct);
      setPhase(currentPhase);
      setSegIdx(seg);
      setEtaSecs(Math.max(0, Math.ceil((1 - pct) * duration)));

      if (pct >= 1) {
        if (currentPhase === 'travel') {
          // arrived at stop seg+1 — dwell
          currentPhase = 'dwell';
          seg = Math.min(seg + 1, stops.length - 1);
        } else {
          // done dwelling — move to next segment
          currentPhase = 'travel';
          if (seg >= stops.length - 1) {
            // loop back to start after a pause
            seg = 0;
          }
        }
        phaseStart = Date.now();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [stops]);

  // ── Derived bus (x,y) ─────────────────────────────────────────
  const busPos = useMemo(() => {
    if (!stops.length) return { x: 40, y: 110 };
    if (phase === 'dwell') {
      const s = stops[Math.min(segIdx, stops.length - 1)];
      return { x: s.x, y: s.y };
    }
    const from = stops[segIdx] || stops[0];
    const to   = stops[Math.min(segIdx + 1, stops.length - 1)] || from;
    // ease-in-out interpolation
    const t = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
  }, [stops, phase, segIdx, progress]);

  const arrivedAt  = phase === 'dwell' ? segIdx : segIdx;
  const nextStopIdx = phase === 'travel' ? segIdx + 1 : segIdx + 1;
  const nextStop    = stops[Math.min(nextStopIdx, stops.length - 1)];
  const currentStop = stops[Math.min(arrivedAt, stops.length - 1)];

  // ── Build SVG path through stops ──────────────────────────────
  const pathD = useMemo(() => {
    if (!stops.length) return '';
    const pts = stops.map(s => `${s.x},${s.y}`);
    return `M ${pts.join(' L ')}`;
  }, [stops]);

  if (!route) return null;

  return (
    <div className={styles.tracker}>
      {/* ── Live badge ─────────────────────────────── */}
      <div className={styles.liveBar}>
        <span className={styles.liveDot} />
        <span className={styles.liveLabel}>LIVE</span>
        <Radio size={13} />
        <span className={styles.routeName}>{route.name}</span>
      </div>

      {/* ── SVG Map ────────────────────────────────── */}
      <div className={styles.mapWrap}>
        <svg viewBox="0 0 440 220" className={styles.map} preserveAspectRatio="xMidYMid meet">
          {/* Road shadow */}
          <path d={pathD} className={styles.roadShadow} strokeWidth="10" fill="none" />
          {/* Road */}
          <path d={pathD} className={styles.road} strokeWidth="6" fill="none" />
          {/* Travelled portion — highlighted */}
          {stops.slice(0, segIdx + 1).length > 1 && (
            <path
              d={`M ${stops.slice(0, segIdx + 1).map(s => `${s.x},${s.y}`).join(' L ')}`}
              className={styles.roadTravelled}
              strokeWidth="6"
              fill="none"
            />
          )}

          {/* Stop markers */}
          {stops.map((stop, i) => {
            const isVisited = i < arrivedAt || (phase === 'dwell' && i === arrivedAt);
            const isCurrent = phase === 'dwell' && i === arrivedAt;
            return (
              <g key={stop.id}>
                {/* Outer ring for current */}
                {isCurrent && (
                  <circle cx={stop.x} cy={stop.y} r={14} className={styles.currentRing} />
                )}
                <circle
                  cx={stop.x} cy={stop.y} r={8}
                  className={isVisited ? styles.stopVisited : styles.stopPending}
                />
                {/* Stop number */}
                <text x={stop.x} y={stop.y + 4} className={styles.stopNum}>{i + 1}</text>
                {/* Stop label */}
                <text
                  x={stop.x}
                  y={stop.y + (i % 2 === 0 ? 22 : -14)}
                  className={styles.stopLabel}
                  textAnchor="middle"
                >
                  {stop.name.split(' (')[0]}
                </text>
              </g>
            );
          })}

          {/* ── Animated Bus ──────────────────────── */}
          <motion.g
            animate={{ x: busPos.x, y: busPos.y }}
            transition={{ type: 'tween', duration: 0.15, ease: 'linear' }}
          >
            {/* Glow */}
            <circle cx={0} cy={0} r={14} className={styles.busGlow} />
            {/* Body */}
            <circle cx={0} cy={0} r={10} className={styles.busBody} />
            {/* Bus icon text */}
            <text x={0} y={4} textAnchor="middle" fontSize="11" className={styles.busEmoji}>🚌</text>
          </motion.g>
        </svg>
      </div>

      {/* ── Status panel ───────────────────────────── */}
      <div className={styles.status}>
        <div className={styles.statusCard}>
          <div className={styles.statusIcon} style={{ background: 'var(--color-success)22', color: 'var(--color-success)' }}>
            <MapPin size={16} />
          </div>
          <div className={styles.statusInfo}>
            <span className={styles.statusLabel}>
              {phase === 'dwell' ? 'At Stop' : 'Last Stop'}
            </span>
            <span className={styles.statusValue}>{currentStop?.name?.split(' (')[0]}</span>
          </div>
        </div>

        <ChevronRight size={18} className={styles.chevron} />

        <div className={styles.statusCard}>
          <div className={styles.statusIcon} style={{ background: 'var(--color-primary)22', color: 'var(--color-primary)' }}>
            <Clock size={16} />
          </div>
          <div className={styles.statusInfo}>
            <span className={styles.statusLabel}>
              {phase === 'travel' ? `Next Stop · ${etaSecs}s` : 'Departing in'}
            </span>
            <span className={styles.statusValue}>
              {phase === 'travel'
                ? nextStop?.name?.split(' (')[0]
                : `${etaSecs}s`}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stop timeline ──────────────────────────── */}
      <div className={styles.timeline}>
        {stops.map((stop, i) => {
          const isVisited = i < arrivedAt || (phase === 'dwell' && i <= arrivedAt);
          const isCurrent = phase === 'dwell' && i === arrivedAt;
          return (
            <div key={stop.id} className={`${styles.timelineStop} ${isCurrent ? styles.timelineCurrent : ''}`}>
              <div className={`${styles.timelineDot} ${isVisited ? styles.timelineDotVisited : ''}`}>
                {isCurrent && <span className={styles.timelinePulse} />}
              </div>
              <span className={`${styles.timelineLabel} ${isVisited ? styles.timelineLabelVisited : ''}`}>
                {stop.name.split(' (')[0]}
              </span>
              {i < stops.length - 1 && (
                <div className={`${styles.timelineLine} ${isVisited ? styles.timelineLineVisited : ''}`} />
              )}
            </div>
          );
        })}
      </div>

      {booking && (
        <div className={styles.yourStop}>
          <Bus size={14} />
          Your stop: <strong>{booking.routeName}</strong> · Seat {booking.seatNumber}
        </div>
      )}
    </div>
  );
}
