import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Map, Clock, Bus } from 'lucide-react';
import { useRoutes } from '../../hooks/useRoutes';
import { EmptyState } from '../../components/common/EmptyState';
import styles from './RouteDirectoryPage.module.css';

export default function RouteDirectoryPage() {
  const { activeRoutes } = useRoutes();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic: if a user types something, we check if the route name or any of its stops match.
  const query = searchQuery.toLowerCase().trim();

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
      <motion.div className={styles.header} variants={itemVars}>
        <h1 className={styles.title}>Route Directory</h1>
        <p className={styles.subtitle}>Explore all campus shuttle routes and find your block.</p>
      </motion.div>

      <motion.div className={styles.searchWidget} variants={itemVars}>
        <label className={styles.searchLabel}>
          <Search size={18} /> Search for a specific block or location
        </label>
        <div className={styles.searchInputWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="e.g. Block 34, Girls Hostel, Auditorium..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      <motion.div className={styles.grid} variants={containerVars} initial="hidden" animate="show" layout>
        <AnimatePresence>
          {activeRoutes.map(route => {
            // Determine if this route matches the search
            const matchesRouteName = route.name.toLowerCase().includes(query);
            const matchingStops = route.stops.filter(s => s.name.toLowerCase().includes(query));
            const hasMatch = query === '' || matchesRouteName || matchingStops.length > 0;
            
            return (
              <motion.div 
                key={route.id}
                layout
                variants={itemVars}
                className={`${styles.routeCard} ${!hasMatch ? styles.dimmed : ''}`}
              >
                <div className={styles.cardHeader}>
                  <h3 className={styles.routeName}>
                    <Map size={20} className={styles.routeIcon} />
                    {route.name}
                  </h3>
                </div>
                
                <div className={styles.meta}>
                  <div className={styles.metaItem}>
                    <MapPin size={14} />
                    <span>{route.stops.length} Stops</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Clock size={14} />
                    <span>~{route.estimatedDurationMins} min</span>
                  </div>
                </div>

                <div className={styles.timeline}>
                  {route.stops.sort((a,b) => a.order - b.order).map(stop => {
                    const isStopMatch = query !== '' && stop.name.toLowerCase().includes(query);
                    return (
                      <div key={stop.id} className={styles.stopRow}>
                        <div className={styles.stopLine}>
                          <div className={`${styles.stopDot} ${isStopMatch ? styles.stopDotMatch : ''}`} />
                          <div className={styles.line} />
                        </div>
                        <span className={`${styles.stopName} ${isStopMatch ? styles.stopNameMatch : ''}`}>
                          {stop.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
