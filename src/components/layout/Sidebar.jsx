import React, { useRef, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { LayoutDashboard, Calendar, Route, BookOpen, LogOut, Moon, Sun } from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard',        icon: LayoutDashboard },
  { to: '/admin/drivers',   label: 'Driver Schedule',  icon: Calendar },
  { to: '/admin/routes',    label: 'Route Management', icon: Route },
  { to: '/admin/bookings',  label: 'Bookings',         icon: BookOpen },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem('sidebarWidth');
    return saved ? parseInt(saved, 10) : 240;
  });
  
  const isResizing = useRef(false);

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
    localStorage.setItem('sidebarWidth', width);
  }, [width]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current) return;
    let newWidth = e.clientX;
    if (newWidth < 52) newWidth = 52;
    if (newWidth > 300) newWidth = 300;
    setWidth(newWidth);
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const expanded = width > 100;

  return (
    <aside className={styles.sidebar} style={{ width: `${width}px` }}>
      <div className={styles.logo}>
        <img src="/logo.png" alt="Logo" width="22" height="22" className="shrink-0" style={{ borderRadius: '4px' }} />
        {expanded && <span className={styles.brandText}>MoveInSync</span>}
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `${styles.navItem} ${expanded ? styles.navItemExpanded : ''} ${isActive ? styles.active : ''}`
              }
              title={!expanded ? item.label : undefined}
            >
              <Icon size={18} />
              {expanded && <span className={styles.navLabel}>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className={styles.bottom}>
        <button 
          className={`${styles.bottomBtn} ${expanded ? styles.bottomBtnExpanded : ''}`} 
          onClick={toggleTheme}
          title={!expanded ? "Toggle Theme" : undefined}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {expanded && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button 
          className={`${styles.bottomBtn} ${expanded ? styles.bottomBtnExpanded : ''}`} 
          onClick={() => { logout(); navigate('/login'); }}
          title={!expanded ? "Logout" : undefined}
        >
          <LogOut size={18} />
          {expanded && <span>Logout</span>}
        </button>

        <div className={`${styles.userProfile} ${expanded ? styles.userProfileExpanded : ''}`}>
          <div className={styles.avatar}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          {expanded && (
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name || 'Admin User'}</span>
              <span className={styles.userRole}>Administrator</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.resizer} onMouseDown={handleMouseDown} />
    </aside>
  );
}
