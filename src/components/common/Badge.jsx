import styles from './Badge.module.css';

const variantMap = {
  confirmed: 'success',
  completed: 'neutral',
  cancelled: 'error',
  scheduled: 'info',
  active:    'success',
  inactive:  'neutral',
  duty:      'primary',
  break:     'warning',
};

export function Badge({ children, variant, label }) {
  const v = variant || variantMap[String(children || label).toLowerCase()] || 'neutral';
  const text = children || label;
  return (
    <span className={`${styles.badge} ${styles[v]}`}>
      {text}
    </span>
  );
}
