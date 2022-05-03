import { Tooltip } from '@nextui-org/react'
import React, { useEffect, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import useUser from '../../../../hooks/auth/useUser'
import { isMobile } from '../../../../utils'
import Avatar from './avatar'

const MoreAction = ({ onReactMessage, onReplyMessage }) => {
  const reactions = [
    {
      name: 'like',
      symbol: '👍',
    },
    {
      name: 'complete',
      symbol: '✅',
    },
    {
      name: 'look',
      symbol: '👀',
    },
  ]

  return (
    <div className="message__more-actions">
      {reactions.map((reaction) => {
        return (
          <div
            key={reaction.name}
            className="message__more-actions--item"
            onClick={(e) => {
              onReactMessage(reaction)
            }}
          >
            {reaction.symbol}
          </div>
        )
      })}
      <div className="message__more-actions--item" onClick={onReplyMessage}>
        Reply
      </div>
    </div>
  )
}

const ReactionDisplay = ({ reaction, showTooltip }) => {
  let reactionDisplay = reaction.symbol + ' ' + reaction.by.length
  return showTooltip ? (
    <Tooltip
      hideArrow
      css={{
        height: 80,
        width: 200,
        backgroundColor: '$black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& > div': {
          color: '#fff',
          fontSize: 12,
          padding: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 5,
          textAlign: 'center',
          '& > div > p': {
            marginTop: 7,
          },
        },
      }}
      content={
        <div>
          <span>{reaction.symbol}</span>
          <p>You (click to remove) reacted with :{reaction.name}</p>
        </div>
      }
    >
      {reactionDisplay}
    </Tooltip>
  ) : (
    reactionDisplay
  )
}

const MessageItem = ({
  message,
  isInThread,
  onReactMessage,
  onReplyMessage,
  onRemoveReaction,
}) => {
  const [moreActionVisible, setMoreActionVisible] = useState(false)
  const { data: user } = useUser()

  const handleRemoveReaction = (reaction) => {
    onRemoveReaction({ ...reaction, messageId: message.id })
  }

  const handleReactMessage = (reaction) => {
    const existingReaction = message.reactions.find(
      (r) => r.name === reaction.name
    )

    if (existingReaction?.by.some((item) => user.id !== item)) {
      console.log('cant do reaction on the one belong to other')
      return
    }
    if (existingReaction) {
      onRemoveReaction({ ...existingReaction, messageId: message.id })
    } else {
      onReactMessage({ ...reaction, messageId: message.id })
    }
  }

  const handleReplyMessage = () => {
    onReplyMessage(message.id)
  }

  return (
    <div
      className="message"
      onMouseEnter={(e) => {
        setMoreActionVisible(true)
      }}
      onMouseLeave={() => {
        setMoreActionVisible(false)
      }}
      onTouchStart={() => setMoreActionVisible(true)}
    >
      <Avatar src={message.avatarUrl} />
      <div className="message__content">
        <p className="message__content--username">
          {message.createdBy}
          {!isInThread && (
            <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
          )}
        </p>
        <p className="message__content--message">{message.text}</p>
        {!isInThread && (
          <div className="message__content--reactions">
            {message.reactions &&
              message.reactions.map((reaction) => {
                let showTooltip = reaction.by.some((item) => user.id === item)
                return (
                  <div
                    key={`reaction_${reaction.id}`}
                    onClick={() =>
                      showTooltip && handleRemoveReaction(reaction)
                    }
                  >
                    <ReactionDisplay
                      showTooltip={showTooltip}
                      reaction={reaction}
                    />
                  </div>
                )
              })}
          </div>
        )}
        {message.replies > 0 && (
          <div className="message__content--number-replies">
            <p onClick={handleReplyMessage}>
              {message.replies} {message.replies > 1 ? 'replies' : 'reply'}
            </p>
          </div>
        )}
      </div>
      {moreActionVisible && !isInThread && (
        <MoreAction
          message={message}
          onReactMessage={handleReactMessage}
          onReplyMessage={handleReplyMessage}
        />
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
  onReactMessage,
  onReplyMessage,
  onRemoveReaction,
  onFetchMore,
}) => {
  const messagesRef = useRef()

  useEffect(() => {
    if (messagesRef && messagesRef.current) {
      if (!fetchMore && !isLoading) {
        messagesRef.current.scroll({
          top: messagesRef.current.scrollHeight,
        })
      } else if (hasMore) {
        messagesRef.current.scroll({
          top: 80,
        })
      }
    }
  }, [fetchMore, hasMore, messages, isLoading])

  const handleScroll = (e) => {
    e.preventDefault()
    if (messagesRef.current.scrollTop === 0 || !hasMore) {
      return
    }

    const bottom =
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight
    if (messagesRef.current.scrollTop < 20 && !bottom) {
      onFetchMore()
    }
  }

  if (isLoading) {
    return (
      <div className="message-list-skeleton">
        <div className="message-skeleton-avatar">
          <Skeleton
            count={isMobile() ? 10 : 11}
            style={{ height: 50, marginBottom: 14 }}
          />
        </div>
        <div className="message-skeleton-main">
          <Skeleton
            count={isMobile() ? 10 : 11}
            style={{ height: 50, marginBottom: 14 }}
          />
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
                onReactMessage={onReactMessage}
                onReplyMessage={onReplyMessage}
                onRemoveReaction={onRemoveReaction}
              />
              {index !== messages.length - 1 && <div className="line-break" />}
            </div>
          )
        })}
    </div>
  )
}

export default Messages
