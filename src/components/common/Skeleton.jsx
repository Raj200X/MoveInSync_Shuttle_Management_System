import styles from './Skeleton.module.css';

export function Skeleton({ width, height, borderRadius, className }) {
  return (
    <span
      className={`${styles.skeleton} ${className || ''}`}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className={styles.card}>
      <Skeleton height="14px" width="60%" borderRadius="4px" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height="12px" width={`${80 - i * 15}%`} borderRadius="4px" />
      ))}
    </div>
  );
}

export function SkeletonRow({ cols = 4 }) {
  return (
    <tr className={styles.row}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '0.75rem 1rem' }}>
          <Skeleton height="12px" width={`${60 + Math.random() * 30}%`} borderRadius="4px" />
        </td>
      ))}
    </tr>
  );
}
