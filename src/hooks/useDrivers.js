/**
 * useDrivers — manages driver data (mock layer)
 */
import { useState, useCallback } from 'react';
import driversData from '../mock/drivers.json';

let store = [...driversData];

export function useDrivers() {
  const [drivers, setDrivers] = useState(store);

  const refresh = useCallback(() => setDrivers([...store]), []);

  const createDriver = useCallback((data) => {
    const newDriver = { id: `d${Date.now()}`, ...data, avatar: data.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) };
    store = [...store, newDriver];
    refresh();
    return newDriver;
  }, [refresh]);

  const updateDriver = useCallback((id, data) => {
    store = store.map(d => d.id === id ? { ...d, ...data } : d);
    refresh();
  }, [refresh]);

  const toggleActive = useCallback((id) => {
    store = store.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d);
    refresh();
  }, [refresh]);

  return {
    drivers,
    activeDrivers: drivers.filter(d => d.isActive),
    createDriver,
    updateDriver,
    toggleActive,
    getDriver: (id) => store.find(d => d.id === id),
  };
}
