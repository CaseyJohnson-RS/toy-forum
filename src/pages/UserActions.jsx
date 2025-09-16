import React, { useState, useEffect, useRef } from 'react';
import { getLogs, getAllUsers } from '../server';
import '../styles/user-actions.css';

export default function UserActions() {
  // selected больше не нужен
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userFilterInput, setUserFilterInput] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAllUsers(),
      getLogs()
    ]).then(([users, logs]) => {
      setUsers(Array.isArray(users) ? users : []);
      setLogs(Array.isArray(logs) ? logs : []);
      setError('');
    }).catch(() => setError('Ошибка загрузки данных')).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (userFilter.trim() === '') {
      getLogs().then(l => setLogs(Array.isArray(l) ? l : []));
    } else {
      getLogs(userFilter).then(l => setLogs(Array.isArray(l) ? l : []));
    }
  }, [userFilter]);

  const exportToXML = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<logs>\n` +
      logs.map(l =>
        `  <log>\n` +
        `    <time>${l.time}</time>\n` +
        `    <username>${l.username}</username>\n` +
        `    <action>${l.action}</action>\n` +
        `  </log>`
      ).join('\n') +
      `\n</logs>`;
    const blob = new Blob([xml], {type: 'application/xml'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'logs.xml';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  return (
    <div className="user-actions-container">
      <h2 className="user-actions-title">Активность пользователей</h2>
      {loading && <div style={{color:'gray'}}>Загрузка...</div>}
      {error && <div style={{color:'red'}}>{error}</div>}
      {!loading && !error && (
        <>
          <div className="user-actions-filter-group">
            <input
              ref={inputRef}
              type="text"
              className="user-actions-input"
              placeholder="Фильтр по имени пользователя"
              value={userFilterInput}
              onChange={e => {
                setUserFilterInput(e.target.value);
                setShowAutocomplete(true);
              }}
              onFocus={() => setShowAutocomplete(true)}
              onBlur={() => setTimeout(() => setShowAutocomplete(false), 100)}
              autoComplete="off"
            />
            <button
              className="user-actions-btn"
              onClick={() => setUserFilter(userFilterInput.trim())}
              disabled={userFilterInput.trim() === userFilter}
            >Применить</button>
            <div style={{flex:1}}></div>
            <button
              className="user-actions-btn export"
              onClick={() => { exportToXML(); }}
            >Выгрузить в XML</button>
            {showAutocomplete && userFilterInput && users.filter(u => u.username.toLowerCase().includes(userFilterInput.toLowerCase())).length > 0 && (
              <div className="user-actions-autocomplete">
                {users.filter(u => u.username.toLowerCase().includes(userFilterInput.toLowerCase())).map(u => (
                  <div
                    key={u.username}
                    className="user-actions-autocomplete-item"
                    onMouseDown={() => {
                      setUserFilterInput(u.username);
                      setShowAutocomplete(false);
                      if (inputRef.current) inputRef.current.blur();
                    }}
                  >{u.username}</div>
                ))}
              </div>
            )}
          </div>
          <ul className="user-actions-logs">
            {logs.map((l, i) => (
              <li key={i} className="user-actions-log-item">
                <span className="user-actions-log-time">{l.time}</span>
                <b className="user-actions-log-user">{l.username}</b> — <span className="user-actions-log-action">{l.action}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
