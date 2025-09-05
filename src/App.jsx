import React, { useState, useEffect } from 'react';
import Registration from './pages/Registration';
import Login from './pages/Login';
import TopicList from './pages/TopicList';
import TopicView from './pages/TopicView';
// import UserList from './pages/UserList';
import UserActions from './pages/UserActions';
import AdminPanel from './pages/AdminPanel';
import CreateTopic from './pages/CreateTopic';
import { getSessionUser, logoutUser, isAdmin } from './server';


export default function App() {
  const [page, setPage] = useState('login');
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  // При монтировании приложения получаем пользователя из сессии
  useEffect(() => {
    setLoadingUser(true);
    getSessionUser().then(u => setUser(u)).finally(() => setLoadingUser(false));
  }, []);
  const [selectedTopic, setSelectedTopic] = useState(null);
  // sidebarOpen и setSidebarOpen больше не нужны

  const handleLogin = u => {
    setUser(u);
    setPage('topics');
  };
  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setPage('login');
  };
  const handleRegistered = () => setPage('login');
  const handleSelectTopic = id => {
    setSelectedTopic(id);
    setPage('topic');
  };
  const handleCreatedTopic = (id) => {
    setSelectedTopic(id);
    setPage('topic');
  };

  if (loadingUser) {
    return (
      <div style={{display:'flex', minHeight:'100vh', alignItems:'center', justifyContent:'center', background:'#23272f'}}>
        <div style={{color:'gray', fontSize:'1.2em'}}>Загрузка...</div>
      </div>
    );
  }

  return (
    <div style={{display:'flex', minHeight:'100vh'}}>
      <aside style={{width: '220px', background:'#343541', padding: '2em 1em', display:'flex', flexDirection:'column', alignItems:'flex-start', borderRight:'1px solid #444654'}}>
        <h1 style={{fontSize:'1.5em', marginBottom:'2em', color:'#ececf1'}}>Forum</h1>
        {user ? (
          <nav style={{display:'flex', flexDirection:'column', gap:'1em', width:'100%', height:'100%', minHeight: '60vh', position:'relative'}}>
            <div style={{display:'flex', flexDirection:'column', gap:'1em'}}>
              <button onClick={() => setPage('topics')}>Обсуждения</button>
              <button onClick={() => setPage('createTopic')}>Создать тему</button>
              {isAdmin(user) && <>
                {/* <button onClick={() => setPage('users')}>Пользователи</button> */}
                <button onClick={() => setPage('actions')}>Активность пользователей</button>
                <button onClick={() => setPage('adminPanel')}>Админ-панель</button>
              </>}
            </div>
            <button onClick={handleLogout} style={{
              background:'#e53935',
              color:'#fff',
              border:'none',
              borderRadius:8,
              padding:'12px 32px',
              fontWeight:600,
              fontSize:'1em',
              cursor:'pointer',
              minHeight:40,
              transition:'background 0.2s',
              position:'absolute',
              left:0,
              right:0,
              bottom:0,
              margin:'1em 0',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#b71c1c'}
            onMouseLeave={e => e.currentTarget.style.background = '#e53935'}
            >Выйти</button>
          </nav>
        ) : (
          <nav style={{display:'flex', flexDirection:'column', gap:'1em', width:'100%'}}>
            <button onClick={() => setPage('login')}>Вход</button>
            <button onClick={() => setPage('register')}>Регистрация</button>
          </nav>
        )}
      </aside>
      <main style={{flex:1, display:'flex', justifyContent:'center', alignItems:'center', background:'#23272f'}}>
        <div style={{width:'100%', maxWidth:'1100px', minWidth:'350px', padding:'2vw 2vw', boxSizing:'border-box'}}>
          {!user && page === 'login' && <Login onLoggedIn={handleLogin} />}
          {!user && page === 'register' && <Registration onRegistered={handleRegistered} />}
          {user && page === 'topics' && <TopicList onSelectTopic={handleSelectTopic} />}
          {user && page === 'createTopic' && <CreateTopic onCreated={handleCreatedTopic} />}
          {user && page === 'topic' && selectedTopic && <TopicView topicId={selectedTopic} onTopicDeleted={() => { setSelectedTopic(null); setPage('topics'); }} />}
          {/* {user && isAdmin(user) && page === 'users' && <UserList />} */}
          {user && isAdmin(user) && page === 'actions' && <UserActions />}
          {user && isAdmin(user) && page === 'adminPanel' && <AdminPanel />}
        </div>
      </main>
    </div>
  );
}
