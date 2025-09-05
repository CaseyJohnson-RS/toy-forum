import React, { useState, useEffect, useRef } from 'react';
import { getMessages, addMessage, getSessionUser, hideMessage, showMessage, isAdmin, editMessage, deleteTopic } from '../server';
import MessageItem from '../components/MessageItem';
import TopicHeader from '../components/TopicHeader';

import { getTopics } from '../server';

export default function TopicView({ topicId, onTopicDeleted }) {
  const [messages, setMessages] = useState([]);
  const [showHidden, setShowHidden] = useState(false);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [filter, setFilter] = useState(''); // текущее значение в поле
  const [appliedFilter, setAppliedFilter] = useState(''); // применённый фильтр
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    Promise.resolve(getSessionUser()).then(u => setUser(u));
  }, []);

  // Загружать сообщения только после загрузки user
  useEffect(() => {
    if (user) {
      loadMessages(topicId);
      setAppliedFilter('');
      setFilter('');
    }
    // eslint-disable-next-line
  }, [topicId, user]);
  const messagesListRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const textareaRef = useRef(null);

  // Проверка необходимости показа кнопок при изменении сообщений
  useEffect(() => {
    const el = messagesListRef.current;
    if (!el) return;
    const checkScroll = () => {
      setShowScrollTop(el.scrollTop > 50);
      setShowScrollBottom(el.scrollHeight - el.scrollTop - el.clientHeight > 50);
    };
    checkScroll();
    el.addEventListener('scroll', checkScroll);
    return () => el.removeEventListener('scroll', checkScroll);
  }, [messages]);

  // Получение названия темы
  useEffect(() => {
    getTopics().then(topics => {
      const topic = topics.find(t => t.id === topicId);
      setTopicTitle(topic ? topic.title : '');
      setTopicDescription(topic && topic.description ? topic.description : '');
    });
  }, [topicId]);

  const loadMessages = async (topicId, filter = '') => {
    setLoading(true);
    setError('');
    try {
      let msgs = await getMessages(topicId, filter, user);
      setMessages(msgs);
    } catch (e) {
      setError('Ошибка загрузки сообщений');
    } finally {
      setLoading(false);
    }
  };



  const handleSend = async () => {
    if (text) {
      setSending(true);
      try {
        await addMessage(topicId, user.username, text);
        await loadMessages(topicId, appliedFilter);
        setText('');
      } catch (e) {
        setError('Ошибка отправки сообщения');
      } finally {
        setSending(false);
      }
    }
  };


  const handleApplyFilter = async (e) => {
    e && e.preventDefault && e.preventDefault();
    setAppliedFilter(filter);
    await loadMessages(topicId, filter);
  };

  const handleResetFilter = async () => {
    setFilter('');
    setAppliedFilter('');
    await loadMessages(topicId, '');
  };

  const handleHide = async id => {
    setLoading(true);
    try {
      await hideMessage(id);
      await loadMessages(topicId, appliedFilter);
    } catch (e) {
      setError('Ошибка скрытия сообщения');
    } finally {
      setLoading(false);
    }
  };
  const handleShow = async id => {
    setLoading(true);
    try {
      await showMessage(id);
      await loadMessages(topicId, appliedFilter);
    } catch (e) {
      setError('Ошибка показа сообщения');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTopic = async () => {
    if (!window.confirm('Удалить обсуждение? Это действие необратимо!')) return;
    setDeleting(true);
    try {
      const res = await deleteTopic(topicId);
      if (res.success) {
        if (onTopicDeleted) onTopicDeleted();
      } else {
        setError(res.error || 'Ошибка удаления обсуждения');
      }
    } catch (e) {
      setError('Ошибка удаления обсуждения');
    } finally {
      setDeleting(false);
    }
  };

  // Функция для подсветки совпадений
  function highlightMatch(text, filter) {
    if (!filter) return text;
    try {
      const regex = new RegExp(`(${filter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, i) =>
        regex.test(part) ? <mark key={i} style={{background:'#ffe066', color:'#222'}}>{part}</mark> : part
      );
    } catch {
      return text;
    }
  }

  return (
    <div style={{position:'relative'}}>
      {/* Кнопка удаления для администратора */}
      {user && isAdmin(user) && (
        <button
          onClick={handleDeleteTopic}
          disabled={deleting}
          style={{
            position:'absolute',
            top:8,
            right:8,
            background:'#e53935',
            color:'#fff',
            border:'none',
            borderRadius:8,
            padding:'8px 18px',
            fontWeight:600,
            fontSize:'1em',
            cursor:'pointer',
            zIndex:2
          }}
        >
          Удалить обсуждение
        </button>
      )}
  <TopicHeader title={topicTitle} description={topicDescription} count={messages.length} />
      <form onSubmit={handleApplyFilter} style={{
        display:'flex', gap:8, alignItems:'center', marginBottom:16, justifyContent:'center', width:'100%'}}>
        <input
          placeholder="Фильтр сообщений"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          disabled={loading}
          style={{
            flex:1,
            minWidth:0,
            maxWidth:400,
            padding:'10px 16px',
            borderRadius: '8px',
            border: '1.5px solid #444654',
            background:'#181a20',
            color:'#ececf1',
            fontSize:'1em',
            outline:'none',
            transition:'border 0.2s',
          }}
        />
        <button type="submit" disabled={loading || (!filter && !appliedFilter)} style={{padding:'10px 18px', borderRadius:8, border:'none', background:'#4f8cff', color:'#fff', fontWeight:600, cursor:'pointer'}}>Найти</button>
        <button type="button" onClick={handleResetFilter} disabled={loading || (!filter && !appliedFilter)} style={{padding:'10px 18px', borderRadius:8, border:'none', background:'#393e46', color:'#fff', fontWeight:600, cursor:'pointer'}}>Сбросить</button>
      </form>
      {loading && <div style={{color:'gray'}}>Загрузка...</div>}
      {error && <div style={{color:'red'}}>{error}</div>}
      <div style={{position:'relative', display:'flex', justifyContent:'center', width:'100%'}}>
        <ul
          ref={messagesListRef}
          style={{
            width:'100%',
            maxWidth:'900px',
            minWidth:'350px',
            minHeight:'300px',
            maxHeight:'500px',
            margin:'0 auto',
            overflowY:'scroll',
            display:'flex',
            flexDirection:'column',
            gap:'0.5em',
            alignItems:'stretch',
            background:'#181a20',
            borderRadius:'16px',
            padding:'1.5em 0',
            boxSizing:'border-box',
            scrollBehavior:'smooth',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE 10+
          }}
          className="hide-scrollbar-forum"
/* ВНИМАНИЕ: Стили для hide-scrollbar-forum должны быть в App.css */
        >
          {messages.map(m => {
            const isOwn = user && m.author === user.username;
            const isHidden = m.hidden;
            return (
              <MessageItem
                key={m.id}
                m={m}
                isOwn={isOwn}
                isHidden={isHidden}
                user={user}
                appliedFilter={appliedFilter}
                loading={loading}
                handleShow={handleShow}
                handleHide={handleHide}
                loadMessages={loadMessages}
                topicId={topicId}
                editMessage={editMessage}
                isAdminUser={isAdmin(user)}
              />
            );
          })}
        </ul>
        {/* Кнопки прокрутки */}
        {showScrollTop && (
          <button
            onClick={() => {
              messagesListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{
              position:'absolute', left:10, top:10, zIndex:10, background:'#343541cc', color:'#fff', border:'none', borderRadius:'50%', width:36, height:36, cursor:'pointer', boxShadow:'0 2px 8px #0004', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3em', transition:'background 0.2s',
            }}
            aria-label="Прокрутить вверх"
          >↑</button>
        )}
        {showScrollBottom && (
          <button
            onClick={() => {
              const el = messagesListRef.current;
              el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
            }}
            style={{
              position:'absolute', left:10, bottom:10, zIndex:10, background:'#343541cc', color:'#fff', border:'none', borderRadius:'50%', width:36, height:36, cursor:'pointer', boxShadow:'0 2px 8px #0004', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3em', transition:'background 0.2s',
            }}
            aria-label="Прокрутить вниз"
          >↓</button>
        )}
      </div>
      <div style={{display:'flex', gap:8, alignItems:'center', marginTop:16, width:'100%', justifyContent:'center'}}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => {
            setText(e.target.value);
            const ta = textareaRef.current;
            if (ta) {
              ta.style.height = 'auto';
              const maxRows = 5;
              const lineHeight = 18; // px, примерно для fontSize 1em
              const maxHeight = maxRows * lineHeight;
              console.log(ta.scrollHeight);
              
              ta.style.height = Math.min(ta.scrollHeight, maxHeight) + 'px';
            }
          }}
          placeholder="Введите сообщение..."
          disabled={loading || sending}
          rows={1}
          style={{
            flex:1,
            height: 60,
            minWidth:0,
            maxWidth:600,
            minHeight:40,
            maxHeight:120,
            padding:'10px 16px',
            borderRadius: '8px',
            border: '1.5px solid #444654',
            background:'#181a20',
            color:'#ececf1',
            fontSize:'1em',
            outline:'none',
            resize:'none',
            transition:'border 0.2s',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE 10+
            overflowY: 'auto',
          }}
          className="hide-scrollbar"
        />
        <button
          onClick={handleSend}
          disabled={loading || sending || !text}
          style={{padding:'12px 22px', borderRadius:8, border:'none', background:'#4f8cff', color:'#fff', fontWeight:600, fontSize:'1em', cursor:'pointer', minHeight:40}}
        >Отправить</button>
      </div>
    </div>
  );
}
