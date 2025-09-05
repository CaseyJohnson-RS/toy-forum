import React from 'react';
import '../styles/forum.css';

export default function MessageItem({ m, isOwn, isHidden, user, appliedFilter, loading, handleShow, handleHide, loadMessages, topicId, editMessage, isAdminUser }) {
  const [editing, setEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(m.text);
  const handleEdit = () => setEditing(true);
  const handleCancel = () => { setEditing(false); setEditText(m.text); };
  const handleSave = async () => {
    if (editText.trim() === '') return;
    await editMessage(m.id, editText);
    setEditing(false);
    await loadMessages(topicId, appliedFilter);
  };
  React.useEffect(() => { setEditText(m.text); }, [m.text]);
  return (
    <li
      key={m.id}
      className={`forum-message${isOwn ? ' own' : ''}${isHidden ? ' hidden' : ''}`}
    >
      <div className={`forum-bubble${isOwn ? ' own' : ''}`}>
        <div className={`forum-author${isOwn ? ' own' : ''}`}>{m.author}</div>
        <div className="forum-text">
          {editing
            ? <textarea value={editText} onChange={e => setEditText(e.target.value)} style={{width:'100%', minHeight:40, borderRadius:6, border:'1px solid #888', padding:'6px', fontSize:'1em'}} />
            : (typeof window !== 'undefined' && window.highlightMatch ? window.highlightMatch(m.text, appliedFilter) : m.text)
          }
        </div>
        <div className={`forum-meta${isOwn ? ' own' : ''}`}>
          <span>{m.time ? new Date(m.time).toLocaleString() : ''}</span>
          {isAdminUser && !editing && (
            <>
              <button onClick={handleEdit} className="forum-btn" disabled={loading}>Редактировать</button>
              {isHidden
                ? <button onClick={() => handleShow(m.id)} className="forum-btn show" disabled={loading}>Показать</button>
                : <button onClick={() => handleHide(m.id)} className="forum-btn hide" disabled={loading}>Скрыть</button>
              }
            </>
          )}
          {isAdminUser && editing && (
            <>
              <button onClick={handleSave} className="forum-btn save" disabled={loading || editText.trim() === ''}>Сохранить</button>
              <button onClick={handleCancel} className="forum-btn cancel" disabled={loading}>Отмена</button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}
