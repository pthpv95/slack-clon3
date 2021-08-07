import Head from 'next/head'
import NextImage from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { SocketActions, SocketEvents } from '../../constants/events'
import useUser from '../../hooks/auth/useUser'
import useQueryUserConversations from '../../hooks/chat/useQueryUserConversations'
import { delay } from '../../utils'
import { getDirectMessage, getReplies } from '../api/chat'
import MainContent from './components/main-content'
import Search from './components/search'
import Sidebar from './components/sidebar'
import Thread from './components/thread'

const socket = io(process.env.NEXT_PUBLIC_BE_HOST, {
  withCredentials: true,
})

export default function Chat() {
  const router = useRouter()

  // use state
  const [thread, setThread] = useState(null)
  const [threadsData, setThreadsData] = useState([])
  const [sidebarWidth, setSidebarWidth] = useState(0)
  const [selectedDirectMessage, setSelectedDirectMessage] = useState(null)
  const [initialSidebarWidth, setInitialSizeBarWidth] = useState(0)
  const [socketConnected, setSocketConnected] = useState(false)
  const [newMessage, setNewMessage] = useState(null)
  const [newReply, setNewReply] = useState(null)
  const [messages, setMessages] = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const [fetchMore, setIsFetchMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  // use queries
  const { data: user } = useUser()
  const { data: conversations } = useQueryUserConversations()

  // use refs
  const sidebarRef = useRef()
  const memberRef = useRef()
  const cursorRef = useRef()

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
    cursorRef.current = response.nextCursor
  }

  const _mapMessage = (messages, members) => {
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
    const replies = await getReplies(thread.id)
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
    const response = await getDirectMessage({
      conversationId: selectedDirectMessage.id,
      cursor: nextCursor,
      limit: 5,
    })
    const _messages = _mapMessage(response.messages, response.members)
    setIsFetchMore(true)
    setMessages([..._messages, ...messages])
    setHasMore(!!response.nextCursor)
    cursorRef.current = response.nextCursor
  }

  useEffect(() => {
    if (sidebarRef.current) {
      setInitialSizeBarWidth(sidebarRef.current.clientWidth)
    }

    // TODO: Handle when window resizes
    // window.addEventListener('resize', (e) => {
    // setSidebarWidth('auto')
    // });
    socket.on('connect', () => {
      console.log('connected to server')
      setSocketConnected(true)
    })

    socket.on('disconnect', () => {
      setSocketConnected(false)
      console.log('disconnected to server')
    })

    socket.on(SocketEvents.new_message, (data) => {
      if (data.conversationId) {
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
  }, [])

  useEffect(() => {
    if (conversations && socketConnected) {
      conversations.forEach((room) => {
        socket.emit(SocketActions.join_room, { roomId: room.id })
      })
    }
  }, [conversations, socketConnected])

  return (
    <>
      <Head>
        {/* <script async src="https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js" /> */}
      </Head>
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
          onDragEnd={(e) => {}}
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
            onCloseThread={() => setThread(null)}
            onSubmit={handleSubmitReply}
          />
        )}
      </div>
    </>
  )
}
