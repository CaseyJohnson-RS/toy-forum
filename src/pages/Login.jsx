import React, { useState } from 'react';
import { loginUser } from '../server';
import '../styles/common.css';

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
    <div style={{maxWidth:400, margin:'0 auto', padding:'1% 0'}}>
      <h2 style={{textAlign:'center', marginBottom:'18px'}}>Вход</h2>
      <form onSubmit={handleLogin}>
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
        <button type="submit" disabled={loading} class="submit">Войти</button>
      </form>
      {loading && <div style={{color:'gray', marginTop:8}}>Загрузка...</div>}
      {error && <div style={{color:'red', marginTop:8}}>{error}</div>}
    </div>
  );
}
