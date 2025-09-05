import React, { useState, useEffect } from 'react';
import { getTopics, getRandomTopics, getMessages } from '../server';

export default function TopicList({ onSelectTopic }) {
  const [topics, setTopics] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messagesCount, setMessagesCount] = useState({});
  const [displayTopics, setDisplayTopics] = useState([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    getTopics().then(async (topics) => {
      if (!mounted) return;
      setTopics(topics);
      // Получаем количество сообщений для каждой темы
      const counts = {};
      for (const t of topics) {
        counts[t.id] = (await getMessages(t.id)).length;
      }
      setMessagesCount(counts);
    }).catch(() => {
      if (mounted) setError('Ошибка загрузки тем');
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      // 10 случайных тем, отсортированных по количеству сообщений
      const shuffled = [...topics].sort(() => 0.5 - Math.random());
      const sorted = shuffled.sort((a, b) => (messagesCount[b.id] || 0) - (messagesCount[a.id] || 0));
      setDisplayTopics(sorted.slice(0, 10));
    } else {
      // Результаты поиска
      setDisplayTopics(
        topics.filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
      );
    }
  }, [search, topics, messagesCount]);

  return (
    <>
      <div style={{width:'100%', maxWidth:600, margin:'0 auto', marginBottom:18, minHeight:90, display:'flex', flexDirection:'column', justifyContent:'flex-end'}}>
        <h2 style={{marginTop:0, marginBottom:12, textAlign:'center', fontWeight:700}}>Поиск обсуждений</h2>
        <div style={{width:'100%', display:'flex', justifyContent:'center'}}>
          <input
            placeholder="Запрос"
            value={search}
            onChange={e => setSearch(e.target.value)}
            disabled={loading}
            style={{
              width:'100%',
              maxWidth:600,
              padding:'12px 18px',
              borderRadius: '8px',
              border: '1.5px solid #444654',
              background:'#23272f',
              color:'#ececf1',
              fontSize:'1em',
              outline:'none',
              transition:'border 0.2s',
            }}
          />
        </div>
      </div>
      {loading && <div style={{color:'gray'}}>Загрузка...</div>}
      {error && <div style={{color:'red'}}>{error}</div>}
      {!loading && (
        <ul
          style={{
            maxWidth: 600,
            margin: '0 auto',
            padding: 0,
            listStyle: 'none',
            maxHeight: 10 * 48 + 8, // 10 тем по 48px + небольшой запас
            minHeight: 10 * 48,
            overflowY: 'auto',
            background: 'rgba(35,39,47,0.95)',
            borderRadius: 10,
            boxShadow: '0 2px 8px #0002',
          }}
        >
          {displayTopics.map(t => (
            <li key={t.id} style={{padding:'10px 12px', borderBottom:'1px solid #343541', display:'flex', flexDirection:'column', minHeight: 48}}>
              <div style={{display:'flex', alignItems:'center'}}>
                <div style={{display:'flex', flexDirection:'column', flex:1}}>
                  <button onClick={() => onSelectTopic(t.id)} disabled={loading} style={{background:'none', border:'none', color:'#4f8cff', fontWeight:600, fontSize:'1em', cursor:'pointer', textAlign:'left', padding:0}}>{t.title}</button>
                  {t.description && <span style={{color:'#b0b0b0', fontSize:'0.93em', fontStyle:'italic', marginTop:1, marginLeft:2}}>{t.description}</span>}
                </div>
                <span style={{color:'gray', marginLeft:8, fontSize:'0.95em'}}>{messagesCount[t.id] ?? '...'} сообщений</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
