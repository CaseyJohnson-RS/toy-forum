import React, { useEffect, useState } from 'react';
import { getAllUsers } from '../server';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getAllUsers()
      .then(u => setUsers(Array.isArray(u) ? u : []))
      .catch(() => setError('Ошибка загрузки пользователей'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>Пользователи</h2>
      {loading && <div style={{color:'gray'}}>Загрузка...</div>}
      {error && <div style={{color:'red'}}>{error}</div>}
      {!loading && !error && (
        <ul>
          {users.map(u => (
            <li key={u.username}>{u.username} {u.isAdmin ? '(admin)' : ''}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
