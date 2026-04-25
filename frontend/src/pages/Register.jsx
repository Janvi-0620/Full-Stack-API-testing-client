import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    try {
      await register({ name, email, password });
      nav('/');
    } catch (ex) {
      setErr(ex.message || 'Registration failed');
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '10vh auto', padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Create account</h1>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {err && <div style={{ color: 'var(--danger)' }}>{err}</div>}
        <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input
          className="input"
          type="password"
          placeholder="Password (min 6)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <button type="submit" className="btn btn-primary">
          Register
        </button>
      </form>
      <p style={{ color: 'var(--muted)' }}>
        Have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
