// Simulated server API using localStorage

import { initialUsers } from './data/initialUsers';

const STORAGE_KEYS = {
  USERS: 'forum_users',
  TOPICS: 'forum_topics',
  MESSAGES: 'forum_messages',
  LOGS: 'forum_logs',
  SESSION: 'forum_session',
};

// Удалить обсуждение (admin)
export function deleteTopic(id) {
  return withDelay((() => {
    const topics = getData(STORAGE_KEYS.TOPICS);
    const idx = topics.findIndex(t => t.id === id);
    if (idx === -1) return { error: 'Тема не найдена' };
    topics.splice(idx, 1);
    setData(STORAGE_KEYS.TOPICS, topics);
    // Также удаляем все сообщения этой темы
    const messages = getData(STORAGE_KEYS.MESSAGES).filter(m => m.topicId !== id);
    setData(STORAGE_KEYS.MESSAGES, messages);
    return { success: true };
  })());
}

// Редактировать текст сообщения (admin)
export function editMessage(id, newText) {
  return withDelay((() => {
    const messages = getData(STORAGE_KEYS.MESSAGES);
    const msg = messages.find(m => m.id === id);
    if (msg) msg.text = newText;
    setData(STORAGE_KEYS.MESSAGES, messages);
    return { success: true };
  })());
}

// Показать скрытое сообщение (admin)
export function showMessage(id) {
  return withDelay((() => {
    const messages = getData(STORAGE_KEYS.MESSAGES);
    const msg = messages.find(m => m.id === id);
    if (msg) msg.hidden = false;
    setData(STORAGE_KEYS.MESSAGES, messages);
    return { success: true };
  })());
}

// Записываем заранее некоторых полозователей
const existingUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
let changed = false;
initialUsers.forEach(initUser => {
  if (!existingUsers.find(u => u.username === initUser.username)) {
    existingUsers.push(initUser);
    changed = true;
  }
});
if (changed) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(existingUsers));
}

function getData(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}
function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}


// Имитация задержки ответа сервера
function withDelay(result, ms = 250) {
  return new Promise(resolve => setTimeout(() => resolve(result), ms));
}

// User API
export function registerUser(username, password, isAdmin = false) {
  return withDelay((() => {
    const users = getData(STORAGE_KEYS.USERS);
    if (users.find(u => u.username === username)) return { error: 'User exists' };
    users.push({ username, password, isAdmin });
    setData(STORAGE_KEYS.USERS, users);
    logAction(username, 'register');
    return { success: true };
  })());
}
export function loginUser(username, password) {
  return withDelay((() => {
    const users = getData(STORAGE_KEYS.USERS);
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return { error: 'Invalid credentials' };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    logAction(username, 'login');
    return { success: true, user };
  })());
}

export function logoutUser() {
  return withDelay((() => {
    const user = getSessionUser();
    if (user) logAction(user.username, 'logout');
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    return { success: true };
  })());
}

export function getSessionUser() {
  return withDelay(JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || 'null'));
}

export function changeUserCredentials(username, newUsername, newPassword) {
  return withDelay((() => {
    const users = getData(STORAGE_KEYS.USERS);
    const user = users.find(u => u.username === username);
    if (!user) return { error: 'User not found' };
    user.username = newUsername || user.username;
    user.password = newPassword || user.password;
    setData(STORAGE_KEYS.USERS, users);
    logAction(username, 'change_credentials');
    return { success: true };
  })());
}
export function getAllUsers() {
  return withDelay(getData(STORAGE_KEYS.USERS));
}

// Topic API
export function createTopic(title, creator, description = '') {
  return withDelay((() => {
    const topics = getData(STORAGE_KEYS.TOPICS);
    const id = Date.now().toString();
    topics.push({ id, title, creator, description, hidden: false });
    setData(STORAGE_KEYS.TOPICS, topics);
    logAction(creator, 'create_topic', { title, description });
    return { success: true, id };
  })());
}

export function getTopics() {
  return withDelay(getData(STORAGE_KEYS.TOPICS).filter(t => !t.hidden));
}

export function getRandomTopics(count = 3) {
  return withDelay((() => {
    const topics = getData(STORAGE_KEYS.TOPICS).filter(t => !t.hidden);
    return topics.sort(() => 0.5 - Math.random()).slice(0, count);
  })());
}

export function hideTopic(id) {
  return withDelay((() => {
    const topics = getData(STORAGE_KEYS.TOPICS);
    const topic = topics.find(t => t.id === id);
    if (topic) topic.hidden = true;
    setData(STORAGE_KEYS.TOPICS, topics);
    return { success: true };
  })());
}

// Message API
export function addMessage(topicId, author, text) {
  return withDelay((() => {
    const messages = getData(STORAGE_KEYS.MESSAGES);
    const id = Date.now().toString();
    const time = new Date().toISOString();
    messages.push({ id, topicId, author, text, hidden: false, time });
    setData(STORAGE_KEYS.MESSAGES, messages);
    logAction(author, 'send_message', { topicId });
    return { success: true, id };
  })());
}

// getMessages теперь принимает user (или isAdmin) и возвращает скрытые сообщения для админа
export function getMessages(topicId, filter = '', user = null) {
  return withDelay((() => {
    let messages = getData(STORAGE_KEYS.MESSAGES).filter(m => m.topicId === topicId);
    if (!user || !user.isAdmin) {
      messages = messages.filter(m => !m.hidden);
    }
    if (filter) messages = messages.filter(m => m.text.includes(filter));
    return messages;
  })());
}

export function hideMessage(id) {
  return withDelay((() => {
    const messages = getData(STORAGE_KEYS.MESSAGES);
    const msg = messages.find(m => m.id === id);
    if (msg) msg.hidden = true;
    setData(STORAGE_KEYS.MESSAGES, messages);
    return { success: true };
  })());
}

// Logging
export function logAction(username, action, details = {}) {
  const logs = getData(STORAGE_KEYS.LOGS);
  logs.push({ username, action, details, time: new Date().toISOString() });
  setData(STORAGE_KEYS.LOGS, logs);
}

export function getLogs(username = null) {
  return withDelay((() => {
    const logs = getData(STORAGE_KEYS.LOGS);
    return username ? logs.filter(l => l.username === username) : logs;
  })());
}

export function isAdmin(user) { return user && user.isAdmin; }
