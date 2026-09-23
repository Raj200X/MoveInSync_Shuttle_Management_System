import { useState } from 'react';
import { useRoutes } from '../../hooks/useRoutes';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Route, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, ArrowUp, ArrowDown, X } from 'lucide-react';
import styles from './RouteManagementPage.module.css';

function RouteDrawer({ isOpen, onClose, onSave, initial }) {
  const isEditing = !!initial;
  const [name, setName] = useState(initial?.name || '');
  const [duration, setDuration] = useState(initial?.estimatedDurationMins || 20);
  const [stops, setStops] = useState(initial?.stops ? [...initial.stops].sort((a,b) => a.order - b.order) : []);
  const [stopInput, setStopInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addStop = () => {
    if (!stopInput.trim()) return;
    setStops(s => [...s, { id: `tmp${Date.now()}`, name: stopInput.trim(), order: s.length + 1 }]);
    setStopInput('');
  };

  const removeStop = (idx) => setStops(s => s.filter((_, i) => i !== idx).map((st, i) => ({ ...st, order: i + 1 })));
  const moveStop = (idx, dir) => {
    const arr = [...stops];
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= arr.length) return;
    [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
    setStops(arr.map((s, i) => ({ ...s, order: i + 1 })));
  };

  const handleSave = () => {
    if (!name.trim()) { setError('Route name is required.'); return; }
    if (stops.length < 2) { setError('A route needs at least 2 stops.'); return; }
    setError(''); setLoading(true);
    setTimeout(() => {
      onSave({ name: name.trim(), estimatedDurationMins: Number(duration), stops, ...(initial ? { id: initial.id } : {}) });
      setLoading(false);
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Route' : 'New Route'}
      size="md"
      footer={
        <>
          <Button variant="cancel" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} loading={loading}>{isEditing ? 'Save Changes' : 'Create Route'}</Button>
        </>
      }
    >
      <div className={styles.drawerBody}>
        <div className={styles.field}>
          <label className={styles.label}>Route Name *</label>
          <input className={styles.input} value={name} onChange={e => { setName(e.target.value); setError(''); }} placeholder="e.g. Campus Core Loop" />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Est. Duration (minutes)</label>
          <input className={styles.input} type="number" min={5} max={180} value={duration} onChange={e => setDuration(e.target.value)} />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Stops (in order) *</label>
          <div className={styles.stopInputRow}>
            <input className={styles.input} value={stopInput} onChange={e => setStopInput(e.target.value)}
              placeholder="Stop name…" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addStop())} />
            <Button size="sm" onClick={addStop} disabled={!stopInput.trim()}>Add</Button>
          </div>

          {stops.length === 0 ? (
            <p className={styles.stopHint}>Add at least 2 stops</p>
          ) : (
            <div className={styles.stopList}>
              {stops.map((stop, idx) => (
                <div key={stop.id} className={styles.stopItem}>
                  <span className={styles.stopOrder}>{idx + 1}</span>
                  <span className={styles.stopName}>{stop.name}</span>
                  <div className={styles.stopActions}>
                    <button onClick={() => moveStop(idx, 'up')} disabled={idx === 0} className={styles.stopBtn}><ArrowUp size={12} /></button>
                    <button onClick={() => moveStop(idx, 'down')} disabled={idx === stops.length - 1} className={styles.stopBtn}><ArrowDown size={12} /></button>
                    <button onClick={() => removeStop(idx)} className={`${styles.stopBtn} ${styles.stopBtnDanger}`}><X size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <div className={styles.formError}>{error}</div>}
      </div>
    </Modal>
  );
}

export default function RouteManagementPage() {
  const { routes, createRoute, updateRoute, deleteRoute, toggleActive } = useRoutes();
  const { addToast } = useToast();
  const [drawer, setDrawer] = useState(null); // null | { initial? }
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleSave = (data) => {
    if (data.id) {
      updateRoute(data.id, data);
      addToast('Route updated.', 'success');
    } else {
      createRoute(data);
      addToast('Route created successfully.', 'success');
    }
  };

  const handleDelete = () => {
    deleteRoute(deleteTarget.id);
    addToast('Route deleted.', 'info');
    setDeleteTarget(null);
  };

  const handleToggle = (route) => {
    toggleActive(route.id);
    addToast(`Route ${route.isActive ? 'deactivated' : 'activated'}.`, 'info');
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Route Management</h1>
          <p className={styles.pageSub}>Define and manage shuttle routes and stops</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setDrawer({})}>New Route</Button>
      </div>

      {routes.length === 0 ? (
        <EmptyState
          icon={<Route size={28} />}
          title="No routes configured"
          description="Create your first shuttle route to get started."
          action={<Button onClick={() => setDrawer({})}>Create Route</Button>}
        />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Route Name</th>
                <th>Stops</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map(route => (
                <tr key={route.id} className={styles.tableRow}>
                  <td>
                    <div className={styles.routeName}>{route.name}</div>
                    <div className={styles.routeStops}>
                      {route.stops.sort((a,b) => a.order - b.order).map(s => s.name).join(' → ')}
                    </div>
                  </td>
                  <td><span className={styles.stopCount}>{route.stops.length}</span></td>
                  <td className={styles.duration}>{route.estimatedDurationMins} min</td>
                  <td><Badge>{route.isActive ? 'active' : 'inactive'}</Badge></td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} onClick={() => setDrawer({ initial: route })} title="Edit">
                        <Edit2 size={15} />
                      </button>
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleToggle(route)}
                        title={route.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {route.isActive ? <ToggleRight size={15} style={{ color: 'var(--color-success)' }} /> : <ToggleLeft size={15} />}
                      </button>
                      <button className={`${styles.actionBtn} ${styles.actionDanger}`} onClick={() => setDeleteTarget(route)} title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RouteDrawer
        isOpen={!!drawer}
        onClose={() => setDrawer(null)}
        onSave={handleSave}
        initial={drawer?.initial}
      />

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Route"
        size="sm"
        footer={
          <>
            <Button variant="cancel" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
