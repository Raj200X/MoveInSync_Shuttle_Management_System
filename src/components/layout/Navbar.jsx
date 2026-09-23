import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { Bus, BookOpen, Clock, LogOut, Moon, Sun, Map } from 'lucide-react';
import styles from './Navbar.module.css';

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className={styles.navbar}>
      <div className={styles.leftSpacer}></div>

      <div className={styles.centerNav}>
        <Link to="/student/book" className={styles.brand}>
          <img src="/logo.png" alt="Logo" width="22" height="22" className={styles.brandIcon} style={{ borderRadius: '4px' }} />
          <span className={styles.brandName}>MoveInSync</span>
        </Link>

        <div className={styles.navDivider}></div>

        <nav className={styles.nav} aria-label="Student navigation">
          <Link to="/student/book" className={styles.navLink}>
            <Bus size={16} />
            <span>Book Shuttle</span>
          </Link>
          <Link to="/student/history" className={styles.navLink}>
            <Clock size={16} />
            <span>My Trips</span>
          </Link>
          <Link to="/student/routes" className={styles.navLink}>
            <Map size={16} />
            <span>Route Directory</span>
          </Link>
        </nav>
      </div>

      <div className={styles.userMenu}>
        <button
          className={styles.logoutBtn}
          onClick={toggleTheme}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <div className={styles.avatar}>{user?.avatar || 'U'}</div>
        <span className={styles.userName}>{user?.name?.split(' ')[0]}</span>
        <button
          className={styles.logoutBtn}
          onClick={() => { logout(); navigate('/login'); }}
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
