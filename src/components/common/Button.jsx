import styles from './Button.module.css';

/**
 * Button component
 * @param {('primary'|'secondary'|'ghost'|'danger'|'success')} variant
 * @param {('sm'|'md'|'lg')} size
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  fullWidth = false,
  icon,
  ...props
}) {
  const variants = {
    primary: styles.primary,
    secondary: styles.secondary,
    ghost: styles.ghost,
    danger: styles.danger,
    success: styles.success,
    cancel: styles.cancel,
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={[
        styles.btn,
        variants[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        loading && styles.loading,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {loading && <span className={styles.spinner} aria-hidden />}
      {icon && !loading && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
}
