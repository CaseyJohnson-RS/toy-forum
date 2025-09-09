import React, { useState, useEffect, useRef } from 'react';
import { getMessages, addMessage, getSessionUser, hideMessage, showMessage, isAdmin, editMessage, deleteTopic } from '../server';
import MessageItem from '../components/MessageItem';
import TopicHeader from '../components/TopicHeader';

import { getTopics } from '../server';

export default function TopicView({ topicId, onTopicDeleted }) {
  const [messages, setMessages] = useState([]);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [filter, setFilter] = useState('');
  const [appliedFilter, setAppliedFilter] = useState('');
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
      {/* Кнопка удаления администратора (лол тип)*/}
      {user && isAdmin(user) && (
        <button
          onClick={handleDeleteTopic}
          disabled={deleting}
          style={{ background:'#853231' }}
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
        />
        <button type="submit" disabled={loading || (!filter && !appliedFilter)} class='submit'>Найти</button>
        <button type="button" onClick={handleResetFilter} disabled={loading || (!filter && !appliedFilter)} >Сбросить</button>
      </form>
      {loading && <div style={{color:'gray'}}>Загрузка...</div>}
      {error && <div style={{color:'red'}}>{error}</div>}
      <div style={{justifyContent:'center', width:'100%'}}>
        <ul
          ref={messagesListRef}
          class='message-list hide-scrollbar-forum'
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

        {showScrollTop && (
          <button
            onClick={() => {
              messagesListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{
              position:'absolute', left:-30, top:250, background:'#40414aff', color:'white', borderRadius:'20%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5em',
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
              position:'absolute', left:-30, bottom:100, background:'#40414aff', color:'white', borderRadius:'20%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5em',
            }}
            aria-label="Прокрутить вниз"
          >↓</button>
        )}
      </div>
      <div style={{display:'flex', gap:8, alignItems:'center', marginTop:16, width:'100%', justifyContent:'center'}}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => { setText(e.target.value); }}
          placeholder="Введите сообщение..."
          disabled={loading || sending}
          rows={1}
          style={{
            height: 30,
            resize:'none'
          }}
          className="hide-scrollbar"
        />
        <button
          onClick={handleSend}
          disabled={loading || sending || !text}
          className='submit'
        >Отправить</button>
      </div>
    </div>
  );
}
