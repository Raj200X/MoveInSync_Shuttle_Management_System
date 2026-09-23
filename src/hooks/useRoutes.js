/**
 * useRoutes — manages route data (mock layer)
 * Swap internals with fetch() calls when real API is ready.
 */
import { useState, useCallback } from 'react';
import routesData from '../mock/routes.json';

let store = routesData.map(r => ({ ...r, stops: [...r.stops] }));

export function useRoutes() {
  const [routes, setRoutes] = useState(store);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => setRoutes([...store]), []);

  const createRoute = useCallback((data) => {
    const newRoute = {
      id: `r${Date.now()}`,
      name: data.name,
      isActive: true,
      estimatedDurationMins: data.estimatedDurationMins || 20,
      stops: data.stops || [],
    };
    store = [...store, newRoute];
    refresh();
    return newRoute;
  }, [refresh]);

  const updateRoute = useCallback((id, data) => {
    store = store.map(r => r.id === id ? { ...r, ...data } : r);
    refresh();
  }, [refresh]);

  const deleteRoute = useCallback((id) => {
    store = store.filter(r => r.id !== id);
    refresh();
  }, [refresh]);

  const toggleActive = useCallback((id) => {
    store = store.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r);
    refresh();
  }, [refresh]);

  const addStop = useCallback((routeId, stopName) => {
    store = store.map(r => {
      if (r.id !== routeId) return r;
      const maxOrder = r.stops.reduce((m, s) => Math.max(m, s.order), 0);
      return {
        ...r,
        stops: [...r.stops, { id: `s${Date.now()}`, name: stopName, order: maxOrder + 1 }],
      };
    });
    refresh();
  }, [refresh]);

  const removeStop = useCallback((routeId, stopId) => {
    store = store.map(r => {
      if (r.id !== routeId) return r;
      const filtered = r.stops.filter(s => s.id !== stopId);
      return { ...r, stops: filtered.map((s, i) => ({ ...s, order: i + 1 })) };
    });
    refresh();
  }, [refresh]);

  const reorderStop = useCallback((routeId, stopId, direction) => {
    store = store.map(r => {
      if (r.id !== routeId) return r;
      const stops = [...r.stops].sort((a, b) => a.order - b.order);
      const idx = stops.findIndex(s => s.id === stopId);
      if (direction === 'up' && idx > 0) {
        [stops[idx].order, stops[idx - 1].order] = [stops[idx - 1].order, stops[idx].order];
      } else if (direction === 'down' && idx < stops.length - 1) {
        [stops[idx].order, stops[idx + 1].order] = [stops[idx + 1].order, stops[idx].order];
      }
      return { ...r, stops };
    });
    refresh();
  }, [refresh]);

  return {
    routes,
    loading,
    activeRoutes: routes.filter(r => r.isActive),
    createRoute,
    updateRoute,
    deleteRoute,
    toggleActive,
    addStop,
    removeStop,
    reorderStop,
  };
}
