import React, { useEffect, useState } from 'react';
import Input from '../shared/input';
import Messages from '../shared/messages';

const MainContent = ({ newMessage, onOpenThread, onSendMessage }) => {
  const [textMessage, setTextMessage] = useState('');
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    if(newMessage){
      const newList = [...messages, newMessage]
      if(messages.some(n => n.id === newMessage.id)){
        return
      }
      setMessages(newList);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessage])

  const handleMoreAction = (action) => {
    if (action.type === 'reply') {
      const message = messages.find((m) => m.id === action.id);
      onOpenThread({
        title: message.text,
        id: message.id,
        createdBy: message.createdBy,
        replies: [],
      });
      return;
    }
    const newMessages = messages.map((m) => {
      if (m.id == action.id && m.type != 'reply') {
        const existingReaction = m.reactions.find(
          (rec) => rec.type === action.type
        );
        if (existingReaction) {
          existingReaction.times++;
        } else {
          m.reactions.push({ ...action, times: 1 });
        }
      }
      return m;
    });
    setMessages(newMessages);
  };
  return (
    <div className="main-chat__content">
      <Messages messages={messages} handleMoreAction={handleMoreAction} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setTextMessage('');
          onSendMessage(textMessage);
        }}
      >
        <div className="main-chat__input-box">
          <Input
            id="input-chat"
            value={textMessage}
            autoComplete="off"
            autoFocus={true}
            onChange={(e) => {
              setTextMessage(e.target.value);
            }}
          />
        </div>
      </form>
    </div>
  );
};

export default MainContent;
