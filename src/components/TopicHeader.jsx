import React from 'react';
import '../styles/topic.css';

export default function TopicHeader({ title, description, count }) {
  return (
    <>
      <h2 className="topic-header">{title || 'Тема'}</h2>
      {description && (
        <div className="topic-description">{description}</div>
      )}
      <div className="topic-count">{count} сообщений</div>
    </>
  );
}
