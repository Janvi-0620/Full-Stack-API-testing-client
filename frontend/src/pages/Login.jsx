import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    try {
      await login(email, password);
      nav('/');
    } catch (ex) {
      setErr(ex.message || 'Login failed');
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '10vh auto', padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Sign in</h1>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {err && <div style={{ color: 'var(--danger)' }}>{err}</div>}
        <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary">
          Login
        </button>
      </form>
      <p style={{ color: 'var(--muted)' }}>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
