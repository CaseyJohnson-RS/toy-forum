import React, { useState } from 'react';
import { createTopic, getSessionUser } from '../server';
import '../styles/create-topic.css';

export default function CreateTopic({ onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const user = getSessionUser();

  const handleCreate = async () => {
    setError('');
    if (!title.trim()) {
      setError('Введите название темы');
      return;
    }
    if (!description.trim()) {
      setError('Введите краткое описание');
      return;
    }
    const res = await createTopic(title, user.username, description);
    if (res.success) {
      setMsg('Тема создана');
      setTitle('');
      setDescription('');
      setError('');
      onCreated && onCreated(res.id); // Передаем id созданной темы
    }
  };

  return (
    <div className="create-topic-container">
      <h2 className="create-topic-title">Создать тему</h2>
      <label className="create-topic-label" htmlFor="topic-title">Название темы</label>
      <input
        id="topic-title"
        className="create-topic-input"
        placeholder="Название темы"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <label className="create-topic-label" htmlFor="topic-desc">Краткое описание темы</label>
      <textarea
        id="topic-desc"
        className="create-topic-textarea"
        placeholder="Краткое описание темы"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <button
        className="create-topic-btn"
        onClick={handleCreate}
      >Создать</button>
      {error && <div className="create-topic-msg">{error}</div>}
      {msg && <div className="create-topic-msg" style={{color:'#43a047'}}>{msg}</div>}
*** End Patch
    </div>
  );
}
