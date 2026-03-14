import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  const user = useAuthStore(s => s.user);
  const error = useAuthStore(s => s.error);
  const loading = useAuthStore(s => s.loading);
  const clearError = useAuthStore(s => s.clearError);

  if (user) {
    navigate('/', { replace: true });
    return null;
  }
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="login">
      <div className="login__card">
        <div className="login__header">
          <img src="/icon.png" alt="TechAnywhere" className="login__logo" />
          <h1 className="login__title">TechAnywhere</h1>
          <p className="login__subtitle">Visit Management Platform</p>
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__field">
            <label className="login__label">Email</label>
            <input
              className="login__input"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); clearError(); }}
              placeholder="you@techanywhere.com"
              autoFocus
              required
            />
          </div>

          <div className="login__field">
            <label className="login__label">Password</label>
            <input
              className="login__input"
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); clearError(); }}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="login__error">{error}</p>}

          <button className="login__btn" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
