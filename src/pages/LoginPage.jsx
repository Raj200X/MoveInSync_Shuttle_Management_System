import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Button } from '../components/common/Button';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulate network delay
      await new Promise(r => setTimeout(r, 600));
      const user = login(email, password);
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/student/book');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const autoFill = (role) => {
    if (role === 'STUDENT') { setEmail('student@lpu.in'); setPassword('password'); }
    if (role === 'ADMIN')   { setEmail('admin@lpu.in');   setPassword('admin123'); }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Please enter your details to sign in."
    >
      <form onSubmit={handleLogin} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className={styles.input}
          />
        </div>

        <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
          Sign In
        </Button>

        <div className={styles.registerPrompt}>
          Don't have an account? <Link to="/register" className={styles.link}>Sign up</Link>
        </div>

        {/* Quick Demo Login */}
        <div className={styles.demoBox}>
          <p>Quick Demo Login</p>
          <div className={styles.demoBtns}>
            <button type="button" onClick={() => autoFill('STUDENT')}>Student</button>
            <button type="button" onClick={() => autoFill('ADMIN')}>Admin</button>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
