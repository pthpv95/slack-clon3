import React, { useEffect, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { isMobile } from '../../../../utils'
import Avatar from './avatar'

const MoreAction = ({ message, handleMoreAction }) => {
  const actions = [
    {
      type: 'like',
      text: '👍',
    },
    {
      type: 'haha',
      text: '😂',
    },
    {
      type: 'reply',
      text: 'Reply',
    },
  ]
  return (
    <div className="message__more-actions">
      {actions.map((action) => {
        return (
          <div
            key={action.type}
            className="message__more-actions--item"
            onClick={(e) => {
              handleMoreAction({ ...action, id: message.id })
            }}
          >
            {action.text}
          </div>
        )
      })}
    </div>
  )
}

const MessageItem = ({ message, isInThread, handleMoreAction }) => {
  const [isHover, setIsHover] = useState(false)
  return (
    <div
      className="message"
      onMouseEnter={(e) => {
        setIsHover(true)
      }}
      onMouseLeave={() => {
        setIsHover(false)
      }}
    >
      <Avatar src={message.avatarUrl} />
      <div className="message__content">
        <p className="message__content--username">
          {message.createdBy}
          {!isInThread && (
            <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
          )}
        </p>
        <p>{message.text}</p>
        {!isInThread && (
          <div className="message__content--reactions">
            {message.reactions &&
              message.reactions.map((reaction) => {
                return (
                  <div key={`reaction_${reaction.key}`}>
                    {reaction.text} {reaction.times}
                  </div>
                )
              })}
          </div>
        )}
        {message.replies > 0 && (
          <div className="message__content--number-replies">
            <p
              onClick={(e) => {
                handleMoreAction({ type: 'reply', id: message.id })
              }}
            >
              {message.replies} {message.replies > 1 ? 'replies' : 'reply'}
            </p>
          </div>
        )}
      </div>
      {isHover && !isInThread && (
        <MoreAction message={message} handleMoreAction={handleMoreAction} />
      )}
    </div>
  )
}

const Messages = ({
  messages,
  isInThread,
  fetchMore,
  hasMore,
  isLoading,
  handleMoreAction,
  onFetchMore,
}) => {
  const messagesRef = useRef()

  useEffect(() => {
    if (messagesRef && messagesRef.current) {
      if (!fetchMore) {
        messagesRef.current.scroll({
          top: messagesRef.current.scrollHeight,
        })
      } else if (hasMore) {
        messagesRef.current.scroll({
          top: 80,
        })
      }
    }
  }, [fetchMore, hasMore, messages])

  const handleScroll = (e) => {
    e.preventDefault()
    if (messagesRef.current.scrollTop === 0 || !hasMore) {
      return
    }

    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (messagesRef.current.scrollTop < 20 && !bottom) {
      onFetchMore()
    }
  }
  if (isLoading) {
    return (
      <div className="message-list-skeleton">
        <div className="message-skeleton-avatar" >
          <Skeleton count={isMobile() ? 10 : 12} style={{ height: 50, marginBottom: 16 }} />
        </div>
        <div className="message-skeleton-main">
          <Skeleton count={isMobile() ? 10 : 12} style={{ height: 50, marginBottom: 16 }} />
        </div>
      </div>
    )
  }

  return (
    <div className="message-list" ref={messagesRef} onScroll={handleScroll}>
      {messages &&
        messages.map((item, index) => {
          return (
            <div key={`message_${item.id}`}>
              <MessageItem
                key={index}
                message={item}
                isInThread={isInThread}
                handleMoreAction={handleMoreAction}
              />
              {index !== messages.length - 1 && <div className="line-break" />}
            </div>
          )
        })}
    </div>
  )
}

export default Messages
