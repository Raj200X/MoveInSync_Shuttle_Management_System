import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import styles from './EditBookingModal.module.css';

export function EditBookingModal({ booking, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    vehicleNo: '',
    driverName: '',
    status: '',
    departureTime: '',
  });

  useEffect(() => {
    if (booking) {
      setFormData({
        vehicleNo: booking.vehicleNo || 'MH-12 AB-1234',
        driverName: booking.driverName || 'Steve Smith',
        status: booking.status || 'ACCEPTED',
        departureTime: booking.departureTime || '07:00',
      });
    }
  }, [booking]);

  if (!booking) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...booking, ...formData });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Booking: ${booking.id.slice(-6).toUpperCase()}`}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            Save Changes
          </Button>
        </>
      }
    >
      <div className={styles.container}>
        <div className={styles.passengerInfo}>
          <span className={styles.label}>Passenger</span>
          <div className={styles.value}>{booking.employeeName || 'Unknown'}</div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Status</label>
            <select
              className={styles.select}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="REQUESTED">Requested</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="WAITING">Waiting</option>
              <option value="NO_SHOW">No Show</option>
              <option value="DECLINED">Declined</option>
              <option value="ON_GOING">On Going</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Vehicle Assignment</label>
            <select
              className={styles.select}
              value={formData.vehicleNo}
              onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
            >
              <option value="MH-12 AB-1234">MH-12 AB-1234 (White Bus)</option>
              <option value="MH-14 XY-9876">MH-14 XY-9876 (Silver Sedan)</option>
              <option value="KA-01 CD-5555">KA-01 CD-5555 (Black SUV)</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Assigned Driver</label>
            <select
              className={styles.select}
              value={formData.driverName}
              onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
            >
              <option value="Steve Smith">Steve Smith</option>
              <option value="Rahul Sharma">Rahul Sharma</option>
              <option value="John Doe">John Doe</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Requested Time</label>
            <input
              type="time"
              className={styles.input}
              value={formData.departureTime}
              onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
            />
          </div>
        </form>
      </div>
    </Modal>
  );
}
