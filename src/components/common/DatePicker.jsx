import React, { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parseISO } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import 'react-day-picker/style.css';
import styles from './DatePicker.module.css';

export function DatePicker({ value, onChange, placeholder = "Pick a date", className = '', align = 'right' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse standard YYYY-MM-DD string to Date object
  const selectedDate = value ? parseISO(value + 'T00:00:00') : null;

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (date) => {
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'));
      setIsOpen(false);
    }
  };

  return (
    <div className={`${styles.container} ${className}`} ref={containerRef}>
      <button 
        type="button" 
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
      >
        <CalendarDays size={14} />
        <span>{selectedDate ? format(selectedDate, 'MMM d, yyyy') : placeholder}</span>
      </button>

      {isOpen && (
        <div 
          className={styles.popover} 
          style={align === 'left' ? { left: 0, right: 'auto' } : { right: 0, left: 'auto' }}
        >
          <DayPicker 
            mode="single" 
            selected={selectedDate} 
            onSelect={handleSelect}
            className={styles.calendar}
          />
        </div>
      )}
    </div>
  );
}
