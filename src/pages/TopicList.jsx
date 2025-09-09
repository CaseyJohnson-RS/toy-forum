import  { useState, useEffect } from 'react';
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
      <div>
        <h2 style={{textAlign:'center'}}>Поиск обсуждений</h2>
        <div style={{display:'block', margin: 'auto 5%'}}>
          <input
            placeholder="Запрос"
            value={search}
            onChange={e => setSearch(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>
      {loading && <div style={{color:'gray', display:'block', textAlign:'center', margin: '5%'}}>Загрузка...</div>}
      {error && <div style={{color:'red', display:'block', textAlign:'center', margin: '5%'}}>{error}</div>}
      {!loading && (
        <ul class='topic-list'>
          {displayTopics.map(t => (
            <li key={t.id} style={{padding:'10px', borderBottom:'1px solid #454755ff', display:'block', minHeight: 48}}>
              <div style={{display:'flex', alignItems:'center'}}>
                <div style={{display:'flex', flexDirection:'column', flex:1}}>
                  <button onClick={() => onSelectTopic(t.id)} disabled={loading} class='topic-header'>{t.title}</button>
                  {t.description && <span style={{color:'grey', fontSize:'0.9em', fontStyle:'italic'}}>{t.description}</span>}
                </div>
                <span style={{color:'grey', marginLeft:8, fontSize:'0.9em'}}>{messagesCount[t.id] ?? '...'} сообщений</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
