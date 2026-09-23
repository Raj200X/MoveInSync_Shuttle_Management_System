import { useTheme } from '../../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import styles from './AuthLayout.module.css';

export function AuthLayout({ children, title, subtitle }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.container}>
      <button 
        className={styles.themeToggle} 
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          <div className={styles.mobileLogo}>
            <img src="/logo.png" alt="Logo" width="24" height="24" style={{ borderRadius: '4px' }} />
            <span>MoveInSync</span>
          </div>
          
          <div className={styles.header}>
            <h2>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>

          <div className={styles.formContent}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
