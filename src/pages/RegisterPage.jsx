import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Button } from '../components/common/Button';
import styles from './LoginPage.module.css';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await new Promise(r => setTimeout(r, 600));
      const user = register(name, email, password, role);
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/student/book');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Join the MoveInSync shuttle network."
    >
      <form onSubmit={handleRegister} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="John Doe"
            required
            className={styles.input}
          />
        </div>

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
            minLength={6}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="role">Role</label>
          <select 
            id="role"
            value={role} 
            onChange={e => setRole(e.target.value)}
            className={styles.input}
          >
            <option value="STUDENT">Student / Rider</option>
            <option value="ADMIN">Admin / Operator</option>
          </select>
        </div>

        <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
          Register Account
        </Button>

        <div className={styles.registerPrompt}>
          Already have an account? <Link to="/login" className={styles.link}>Sign in</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
