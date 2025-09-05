import React, { useState } from 'react';
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
    <div style={{maxWidth:400, margin:'0 auto', padding:'2em 0'}}>
      <h2 style={{textAlign:'center', marginBottom:18}}>Регистрация</h2>
      <form onSubmit={handleRegister} style={{display:'flex', flexDirection:'column', gap:16}}>
        <input
          placeholder="Имя пользователя"
          value={username}
          onChange={e => setUsername(e.target.value)}
          disabled={loading}
          style={{
            width:'100%',
            padding:'12px 16px',
            borderRadius:8,
            border:'1.5px solid #444654',
            background:'#23272f',
            color:'#ececf1',
            fontSize:'1em',
            outline:'none',
            marginBottom:4,
            transition:'border 0.2s',
          }}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
          style={{
            width:'100%',
            padding:'12px 16px',
            borderRadius:8,
            border:'1.5px solid #444654',
            background:'#23272f',
            color:'#ececf1',
            fontSize:'1em',
            outline:'none',
            marginBottom:4,
            transition:'border 0.2s',
          }}
        />
        <button type="submit" disabled={loading} style={{
          padding:'12px 32px',
          borderRadius:8,
          border:'none',
          background:'#4f8cff',
          color:'#fff',
          fontWeight:600,
          fontSize:'1em',
          cursor:'pointer',
          minHeight:40,
          margin:'0 auto',
        }}>Зарегистрироваться</button>
      </form>
      {loading && <div style={{color:'gray', marginTop:8}}>Загрузка...</div>}
      {error && <div style={{color:'red', marginTop:8}}>{error}</div>}
    </div>
  );
}
