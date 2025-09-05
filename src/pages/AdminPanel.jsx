import React, { useState, useEffect, useRef } from 'react';
import { changeUserCredentials, getAllUsers } from '../server';
import '../styles/admin-panel.css';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [userFilterInput, setUserFilterInput] = useState('');
  const [selected, setSelected] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    getAllUsers().then(u => setUsers(u));
  }, []);

  const handleChange = async () => {
    if (!selected || !password) {
      setMsg('Выберите пользователя и введите новый пароль');
      return;
    }
    if (!users.find(u => u.username === selected)) {
      setMsg('Пользователь не найден');
      return;
    }
    setLoading(true);
    const res = await changeUserCredentials(selected, selected, password);
    setLoading(false);
    if (res.error) setMsg(res.error);
    else setMsg('Пароль успешно изменён');
    setPassword('');
  };

  return (
    <div className="admin-panel-container">
      <h2 className="admin-panel-title">Админ-панель</h2>
      <div className="admin-panel-subtitle">Смена пароля пользователя</div>
      <div className="admin-panel-input-group">
        <input
          ref={inputRef}
          type="text"
          placeholder="Имя пользователя"
          value={userFilterInput}
          onChange={e => {
            setUserFilterInput(e.target.value);
            setShowAutocomplete(true);
            setSelected(e.target.value);
          }}
          onFocus={() => setShowAutocomplete(true)}
          onBlur={() => setTimeout(() => setShowAutocomplete(false), 100)}
          className="admin-panel-input"
          autoComplete="off"
        />
        {showAutocomplete && userFilterInput && users.filter(u => u.username.toLowerCase().includes(userFilterInput.toLowerCase())).length > 0 && (
          <div className="admin-panel-autocomplete">
            {users.filter(u => u.username.toLowerCase().includes(userFilterInput.toLowerCase())).map(u => (
              <div
                key={u.username}
                className="admin-panel-autocomplete-item"
                onMouseDown={() => {
                  setUserFilterInput(u.username);
                  setSelected(u.username);
                  setShowAutocomplete(false);
                  if (inputRef.current) inputRef.current.blur();
                }}
              >{u.username}</div>
            ))}
          </div>
        )}
      </div>
      <div className="admin-panel-input-group">
        <input
          type="password"
          placeholder="Новый пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="admin-panel-input"
        />
      </div>
      <button
        onClick={handleChange}
        disabled={loading || !selected || !password}
        className="admin-panel-btn"
      >
        Сменить пароль
      </button>
      {msg && (
        <div className={`admin-panel-msg${msg === 'Пароль успешно изменён' ? ' success' : ' error'}`}>{msg}</div>
      )}
    </div>
  );
}
