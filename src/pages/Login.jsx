import { useState } from 'react';
import { loginUser } from '../server';

export default function Login({ onLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser(username, password);
      if (res.error) setError(res.error);
      else onLoggedIn && onLoggedIn(res.user);
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-registrarion-container'>
      <h2 className='login-registrarion-header'>Вход</h2>
      <form onSubmit={handleLogin}>
        <input
          placeholder="Имя пользователя"
          value={username}
          onChange={e => setUsername(e.target.value)}
          disabled={loading}
          type='text'
          
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading} class="submit">Войти</button>
      </form>
      {loading && <div>Загрузка...</div>}
      {error && <div>{error}</div>}
    </div>
  );
}
