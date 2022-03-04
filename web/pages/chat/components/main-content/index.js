import React, { useEffect, useRef, useState } from 'react'
import { isMobile } from '../../../../utils'
import Input from '../shared/input'
import Messages from '../shared/messages'

const MainContent = ({
  newMessage,
  messages,
  fetchMore = false,
  hasMore,
  isLoading,
  onOpenThread,
  onSendMessage,
  onFetchMore,
}) => {
  const [textMessage, setTextMessage] = useState('')
  const [_messages, setMessages] = useState([])
  const inputRef = useRef()

  useEffect(() => {
    if (newMessage) {
      const newList = [..._messages, newMessage]
      if (_messages.some((n) => n.id === newMessage.id)) {
        return
      }
      setMessages(prev => [newList, ...prev])
    }
    
  }, [newMessage])

  useEffect(() => {
    setMessages(messages)
  }, [messages])

  const handleMoreAction = (action) => {
    if (action.type === 'reply') {
      const message = _messages.find((m) => m.id === action.id)
      onOpenThread({
        title: message.text,
        id: message.id,
        createdBy: message.createdBy,
        avatarUrl: message.avatarUrl,
        replies: [],
      })
      return
    }
  }

  return (
    <div className="main-chat__content">
      <Messages
        messages={_messages}
        isLoading={isLoading}
        hasMore={hasMore}
        fetchMore={fetchMore}
        handleMoreAction={handleMoreAction}
        onFetchMore={onFetchMore}
      />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setTextMessage('')
          onSendMessage(textMessage)
        }}
      >
        <div className="main-chat__input-box">
          <Input
            id="input-chat"
            value={textMessage}
            autoComplete="off"
            ref={inputRef}
            autoFocus={!isMobile()}
            onChange={(e) => {
              setTextMessage(e.target.value)
            }}
          />
          <button type="submit">Send</button>
        </div>
      </form>
    </div>
  )
}

export default MainContent
