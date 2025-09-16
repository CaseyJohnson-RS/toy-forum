import { useState, useEffect } from 'react';
import Registration from './pages/Registration';
import Login from './pages/Login';
import TopicList from './pages/TopicList';
import TopicView from './pages/TopicView';
// import UserList from './pages/UserList';
import UserActions from './pages/UserActions';
import AdminPanel from './pages/AdminPanel';
import CreateTopic from './pages/CreateTopic';
import { getSessionUser, logoutUser, isAdmin } from './server';
import './App.css';


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
      <div className='loading-screen'>
        <div>Загрузка...</div>
      </div>
    );
  }

  return (
    <div className='app-containter'>
      <aside>
        <h1>Forum</h1>
        {user ? (
          <nav>
            <div className='nav-group'>
              <button onClick={() => setPage('topics')} className='nav'>Обсуждения</button>
              <button onClick={() => setPage('createTopic')} className='nav'>Создать тему</button>
              {isAdmin(user) && <>
                <button onClick={() => setPage('actions')} className='nav'>Активность пользователей</button>
                <button onClick={() => setPage('adminPanel')} className='nav'>Админ-панель</button>
              </>}
            </div>
            <button onClick={handleLogout} className='nav logout-button'
            
            >Выйти</button>
          </nav>
        ) : (
          <nav>
            <button onClick={() => setPage('login')} className='nav'>Вход</button>
            <button onClick={() => setPage('register')} className='nav'>Регистрация</button>
          </nav>
        )}
      </aside>
      <main >
        <div className='content-area'>
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
