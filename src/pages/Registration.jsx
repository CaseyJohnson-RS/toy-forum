import { useState } from 'react';
import { registerUser } from '../server';

export default function Registration({ onRegistered }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async e => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов');
      return;
    }
    setLoading(true);
    try {
      const res = await registerUser(username, password);
      if (res.error) setError(res.error);
      else onRegistered && onRegistered();
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-registrarion-container'>
      <h2 className='login-registrarion-header'>Регистрация</h2>
      <form onSubmit={handleRegister}>
        <input
          placeholder="Имя пользователя"
          value={username}
          onChange={e => setUsername(e.target.value)}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading} class="submit">Зарегистрироваться</button>
      </form>
      {loading && <div>Загрузка...</div>}
      {error && <div>{error}</div>}
    </div>
  );
}
