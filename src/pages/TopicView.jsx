import React, { useState, useEffect, useRef } from 'react';
import { getMessages, addMessage, getSessionUser, hideMessage, showMessage, isAdmin, editMessage, deleteTopic } from '../server';
import MessageItem from '../components/MessageItem';
import TopicHeader from '../components/TopicHeader';
import '../styles/topic-list.css';

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

  return (
    <div >
      {/* Кнопка удаления администратора (лол тип)*/}
      {user && isAdmin(user) && (
        <button
          onClick={handleDeleteTopic}
          disabled={deleting}
          className='delete'
        >
          Удалить обсуждение
        </button>
      )}
  <TopicHeader title={topicTitle} description={topicDescription} count={messages.length} />
      <form onSubmit={handleApplyFilter} >
        <input
          placeholder="Фильтр сообщений"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          disabled={loading}
        />
      </form>
      {loading && <div>Загрузка...</div>}
      {error && <div>{error}</div>}
      <div className="messages-container">
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
            className="scroll-button up"
            aria-label="Прокрутить вверх"
          >↑</button>
        )}
        {showScrollBottom && (
          <button
            onClick={() => {
              const el = messagesListRef.current;
              el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
            }}
            className="scroll-button down"
            aria-label="Прокрутить вниз"
          >↓</button>
        )}
      </div>
      <div className="message-input-container">
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
