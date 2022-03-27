import NextImage from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SkeletonTheme } from 'react-loading-skeleton'
import { io } from 'socket.io-client'
import { SocketActions, SocketEvents } from '../../constants/events'
import useUser from '../../hooks/auth/useUser'
import useQueryUserConversations from '../../hooks/chat/useQueryUserConversations'
import { isMobile } from '../../utils'
import { getDirectMessage, getReplies } from '../api/chat'
import MainContent from './components/main-content'
import Search from './components/search'
import Sidebar from './components/sidebar'
import Thread from './components/thread'

// @refresh reset
const socket = io(process.env.NEXT_PUBLIC_BE_HOST)
export default function Chat() {
  // use state
  const [thread, setThread] = useState(null)
  const [sidebarWidth, setSidebarWidth] = useState(0)
  const [selectedDirectMessage, setSelectedDirectMessage] = useState(null)
  const [initialSidebarWidth, setInitialSizeBarWidth] = useState(0)
  const [socketConnected, setSocketConnected] = useState(false)
  const [newMessage, setNewMessage] = useState(null)
  const [newReply, setNewReply] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingInThread, setIsLoadingInThread] = useState(false)
  const [fetchMore, setIsFetchMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [selectedScreen, setSelectedScreen] = useState()

  // use queries
  const { data: user } = useUser()
  const { data: conversations } = useQueryUserConversations()

  // use refs
  const sidebarRef = useRef()
  const memberRef = useRef()
  const cursorRef = useRef()
  const currentConversationIdRef = useRef()

  const isMobileScreen = isMobile()

  const handleSubmitReply = (reply, thread) => {
    socket.emit(SocketActions.send_message_in_thread, {
      text: reply,
      userId: user.id,
      threadId: thread.id,
      conversationId: selectedDirectMessage.id,
    })
  }

  const handleDrag = (e) => {
    e.preventDefault()
    if (e.pageX === 0 || e.pageX < initialSidebarWidth) {
      e.stopPropagation()
      e.preventDefault()
      e.cancelable = true
      return
    }
    setSidebarWidth(e.pageX)
  }

  const handleSendMessage = (message) => {
    socket.emit(SocketActions.send_message, {
      text: message,
      userId: user.id,
      conversationId: selectedDirectMessage.id,
    })
  }

  const handleSelectDirectMessage = async (data, cursor = null) => {
    if (selectedScreen && isMobileScreen) {
      setSelectedScreen('main')
    }
    setIsLoading(true)
    setSelectedDirectMessage(data)
    const response = await getDirectMessage({
      conversationId: data.id,
      cursor,
    })
    const _messages = _mapMessages(response.messages, response.members)
    memberRef.current = response.members
    setMessages(_messages)
    setHasMore(!!response.nextCursor)
    setIsFetchMore(false)
    setIsLoading(false)
    cursorRef.current = response.nextCursor
    currentConversationIdRef.current = data.id;
  }

  const _mapMessages = (messages, members) => {
    if (messages.length === 0) return []
    const _messages = messages.map((m) => {
      const user = members.find((member) => member.id == m.createdBy)
      return {
        ...m,
        createdBy: user?.firstName,
        avatarUrl: user?.avatarUrl,
      }
    })
    return _messages
  }

  const handleOpenThread = async (thread) => {
    isMobileScreen && setSelectedScreen('thread')
    const replies = await getReplies(thread.id)
    setNewReply(null);
    setThread({
      id: thread.id,
      title: thread.title,
      createdBy: thread.createdBy,
      avatarUrl: thread.avatarUrl,
      replies: _mapMessages(replies, memberRef.current),
    })
  }

  const handleFetchMore = async () => {
    if (!cursorRef.current) {
      return
    }

    const nextCursor = cursorRef.current.toString()
    cursorRef.current = null
    // setIsLoading(true)
    const response = await getDirectMessage({
      conversationId: selectedDirectMessage.id,
      cursor: nextCursor,
      limit: 5,
    })
    const _messages = _mapMessages(response.messages, response.members)
    setIsFetchMore(true)
    setMessages([..._messages, ...messages])
    setHasMore(!!response.nextCursor)
    // setIsLoading(false)
    cursorRef.current = response.nextCursor
  }

  const handleReactMessage = (reaction) => {
    socket.emit(SocketActions.react_message, {
      name: reaction.name,
      symbol: reaction.symbol,
      messageId: reaction.messageId,
      by: user.id
    })
  }

  const handleRemoveReaction = (reaction) => {
    socket.emit(SocketActions.remove_reaction, {
      id: reaction.id,
      messageId: reaction.messageId,
      conversationId: currentConversationIdRef.current,
      by: user.id,
    })
  }

  const updateNumberRepliesOfMessage = useCallback((newReply) => {
    setMessages(messages => {
      const updateMessages = messages.map(m => {
        if (m.id === newReply.threadId) {
          m.replies++;
        }
        return m;
      })
      return updateMessages
    })
  }, [])

  const updateMessageReactions = useCallback((newReaction) => {
    setMessages(messages => {
      return messages.map(message => {
        if (message.id === newReaction.messageId) {
          message.reactions = newReaction.reactions
        }
        return message;
      })
    })
  }, [])

  const updateMessageReactionRemoved = useCallback(data => {
    setMessages(messages => {
      return messages.map(message => {
        if (message.id === data.messageId) {
          message.reactions = data.reactions
        }
        return message;
      })
    })
  }, [])

  useEffect(() => {
    if (sidebarRef.current) {
      setInitialSizeBarWidth(sidebarRef.current.clientWidth)
    }

    setSelectedScreen(isMobileScreen ? 'sidebar' : null)
    socket.on('connect', () => {
      console.log('connected to server')
      setSocketConnected(true)
    })

    socket.on('disconnect', (e) => {
      setSocketConnected(false)
      console.log('disconnected to server', e)
    })

    socket.on(SocketEvents.new_message, (data) => {
      if (data.conversationId) {
        console.log('new message', data)
        const userInfo = memberRef.current.find(
          (mem) => mem.id == data.createdBy
        )
        const _message = {
          ...data,
          createdBy: userInfo.firstName,
          avatarUrl: userInfo.avatarUrl,
        }

        if (!data.threadId) {
          setNewMessage(_message)
        } else {
          // Update number of replies of message which contains replies in its thread
          updateNumberRepliesOfMessage(_message)
          setNewReply(_message);
        }
      }
    })

    socket.on(SocketEvents.message_reacted, (newReaction) => {
      console.log('message reaction', newReaction);
      // Do nothing when new reaction comes from other conversation
      if (newReaction.conversationId !== currentConversationIdRef.current) {
        return;
      }
      updateMessageReactions(newReaction);
    })

    socket.on(SocketEvents.reaction_removed, (data) => {
      console.log('reaction removed', data);
      if (data.conversationId !== currentConversationIdRef.current) {
        return;
      }
      updateMessageReactionRemoved(data);
    })
  }, [isMobileScreen, updateMessageReactionRemoved, updateMessageReactions, updateNumberRepliesOfMessage])

  useEffect(() => {
    if (conversations && socketConnected) {
      conversations.forEach((room) => {
        socket.emit(SocketActions.join_room, { roomId: room.id })
      })
    }
  }, [conversations, socketConnected])

  const renderScreen = () => {
    if (!selectedScreen) {
      return (
        <div className={`container ${thread ? 'container-open-thread' : ''}`}>
          <div className="search">
            <Search />
          </div>
          <div className="header">
            {selectedDirectMessage && (
              <div className="header__selected-contact">
                <NextImage
                  src={selectedDirectMessage.avatar}
                  alt={selectedDirectMessage.title}
                  width={30}
                  height={30}
                />
                <p>{selectedDirectMessage.title}</p>
              </div>
            )}
          </div>
          <div
            className="sidebar"
            style={{ width: sidebarWidth ? sidebarWidth : 'auto' }}
            ref={sidebarRef}
          >
            <Sidebar
              conversations={conversations}
              onDirectMessageClick={handleSelectDirectMessage}
            />
          </div>
          <div
            draggable
            className="resize"
            onDrag={handleDrag}
            onDragEnd={(e) => { }}
            onDragStart={(e) => {
              const img = new Image()
              img.src =
                'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
              e.dataTransfer.setDragImage(img, 0, 0)
            }}
          ></div>
          <div className={`main-chat ${thread ? 'main-open-thread' : ''}`}>
            {selectedDirectMessage && (
              <MainContent
                isLoading={isLoading}
                newMessage={newMessage}
                messages={messages}
                hasMore={hasMore}
                fetchMore={fetchMore}
                onSendMessage={handleSendMessage}
                onOpenThread={handleOpenThread}
                onFetchMore={handleFetchMore}
                onReactMessage={handleReactMessage}
                onRemoveReaction={handleRemoveReaction}
              />
            )}
          </div>
          {thread !== null && (
            <Thread
              thread={thread}
              newReply={newReply}
              isLoading={isLoadingInThread}
              onCloseThread={() => setThread(null)}
              onSubmit={handleSubmitReply}
            />
          )}
        </div>
      )
    }

    const renderMobileScreen = () => {
      switch (selectedScreen) {
        case 'sidebar':
          return (
            <div
              className="sidebar"
              style={{ width: sidebarWidth ? sidebarWidth : 'auto' }}
              ref={sidebarRef}
            >
              <Sidebar
                conversations={conversations}
                onDirectMessageClick={handleSelectDirectMessage}
              />
            </div>
          )
        case 'main':
          return (
            <>
              <div className="header">
                {selectedDirectMessage && (
                  <div className="header__selected-contact">
                    <NextImage
                      src={'/assets/icons/left-arrow.svg'}
                      alt={selectedDirectMessage.title}
                      width={20}
                      height={20}
                      onClick={() => {
                        setSelectedScreen('sidebar')
                      }}
                    />
                    <p>{selectedDirectMessage.title}</p>
                  </div>
                )}
              </div>
              <div className="main-chat">
                <MainContent
                  isLoading={isLoading}
                  newMessage={newMessage}
                  messages={messages}
                  hasMore={hasMore}
                  fetchMore={fetchMore}
                  onSendMessage={handleSendMessage}
                  onOpenThread={handleOpenThread}
                  onFetchMore={handleFetchMore}
                  onReactMessage={handleReactMessage}
                  onRemoveReaction={handleRemoveReaction}
                />
              </div>
            </>
          )
        case 'thread':
          return (
            thread !== null && (
              <Thread
                thread={thread}
                newReply={newReply}
                onCloseThread={() => {
                  setThread(null)
                  setSelectedScreen('main')
                }}
                onSubmit={handleSubmitReply}
              />
            )
          )
        default:
          break
      }
    }
    return (
      <div className={`container ${thread ? 'container-open-thread' : ''}`}>
        <div className="search">
          <Search />
        </div>
        {renderMobileScreen()}
      </div>
    )
  }
  return (
    <SkeletonTheme color="#202020" highlightColor="#444">
      {renderScreen()}
    </SkeletonTheme>
  )
}
