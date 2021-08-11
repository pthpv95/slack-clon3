import Head from 'next/head'
import NextImage from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { SocketActions, SocketEvents } from '../../constants/events'
import useUser from '../../hooks/auth/useUser'
import useQueryUserConversations from '../../hooks/chat/useQueryUserConversations'
import { delay, isMobile } from '../../utils'
import { getDirectMessage, getReplies } from '../api/chat'
import MainContent from './components/main-content'
import Search from './components/search'
import Sidebar from './components/sidebar'
import Thread from './components/thread'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'

const socket = io(process.env.NEXT_PUBLIC_BE_HOST)

export default function Chat() {
  // const router = useRouter()

  // use state
  const [thread, setThread] = useState(null)
  // const [threadsData, setThreadsData] = useState([])
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
    const _messages = _mapMessage(response.messages, response.members)
    memberRef.current = response.members
    setMessages(_messages)
    setHasMore(!!response.nextCursor)
    setIsFetchMore(false)
    setIsLoading(false)
    cursorRef.current = response.nextCursor
  }

  const _mapMessage = (messages, members) => {
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
    setIsLoadingInThread(true)
    isMobileScreen && setSelectedScreen('thread')
    const replies = await getReplies(thread.id)
    setIsLoadingInThread(false)
    setThread({
      id: thread.id,
      title: thread.title,
      createdBy: thread.createdBy,
      avatarUrl: thread.avatarUrl,
      replies: _mapMessage(replies, memberRef.current),
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
    const _messages = _mapMessage(response.messages, response.members)
    setIsFetchMore(true)
    setMessages([..._messages, ...messages])
    setHasMore(!!response.nextCursor)
    // setIsLoading(false)
    cursorRef.current = response.nextCursor
  }

  useEffect(() => {
    if (sidebarRef.current) {
      setInitialSizeBarWidth(sidebarRef.current.clientWidth)
    }

    setSelectedScreen(isMobileScreen ? 'sidebar' : null)
    // TODO: Handle when window resizes
    // window.addEventListener('resize', (e) => {
    // setSidebarWidth('auto')
    // });
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
        console.log(data)
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
          setNewReply(_message)
        }
      }
    })
  }, [isMobileScreen])

  useEffect(() => {
    if (conversations && socketConnected) {
      conversations.forEach((room) => {
        socket.emit(SocketActions.join_room, { roomId: room.id })
      })
    }
  }, [conversations, socketConnected])

  useEffect(() => {
    if (newReply) {
      const updateMessages = messages.map(m => {
        if (m.id === newReply.threadId) {
          m.replies++;
        }
        return m;
      })
      setMessages(updateMessages)
    }
  }, [newReply])

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
      <Head>
        {/* <script async src="https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js" /> */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      {renderScreen()}
    </SkeletonTheme>
  )
}
