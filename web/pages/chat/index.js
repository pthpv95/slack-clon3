import NextImage from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import MainContent from './components/main-content';
import Search from './components/search';
import Sidebar from './components/sidebar';
import Thread from './components/thread';
import { io } from "socket.io-client";
import { SocketEvents, SocketActions } from '../../constants/events';
import useUser from '../../hooks/auth/useUser';
import useQueryUserConversations from '../../hooks/chat/useQueryUserConversations';

const socket = io(process.env.NEXT_PUBLIC_BE_HOST, {
  withCredentials: true
});

export default function Chat() {
  const router = useRouter()

  // use state
  const [thread, setThread] = useState(null)
  const [threadsData, setThreadsData] = useState([]);
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const [selectedDirectMessage, setSelectedDirectMessage] = useState(null);
  const [initialSidebarWidth, setInitialSizeBarWidth] = useState(0)
  const [socketConnected, setSocketConnected] = useState(false)
  // use queries
  const { data: user } = useUser()
  const { data: conversations } = useQueryUserConversations();

  // use refs
  const socketRef = useRef()
  const sidebarRef = useRef();

  const handleSubmitReply = (reply, thread) => {
    const cloneThreads = Object.assign([], threadsData);
    let existingThread = cloneThreads.find(t => t.id === thread.id)
    if (existingThread) {
      existingThread.replies = [...existingThread.replies];
      existingThread.replies.push({ id: new Date().getTime(), text: reply });
    }
    setThread(Object.assign({}, existingThread));
    setThreadsData(cloneThreads)
  }

  const handleDrag = (e) => {
    e.preventDefault();
    if (e.pageX === 0 || e.pageX < initialSidebarWidth) {
      e.stopPropagation();
      e.preventDefault();
      e.cancelable = true;
      return;
    }
    setSidebarWidth(e.pageX);
  }

  const handleSendMessage = (message) => {
    socket.emit(SocketActions.send_message, {
      message,
      userId: user.id,
      roomId: selectedDirectMessage._id
    }, () => {
      console.log('sent');
    })
  }

  useEffect(() => {
    if (sidebarRef.current) {
      setInitialSizeBarWidth(sidebarRef.current.clientWidth);
    }

    // TODO: Handle when window resizes
    // window.addEventListener('resize', (e) => {
    // setSidebarWidth('auto')
    // });
    socket.on('connect', () => {
      console.log('connected to server');
      setSocketConnected(true)
    })

    socket.on('disconnect', () => {
      setSocketConnected(false)
      console.log('disconnected to server');
    })

    socket.on(SocketEvents.new_message, (data) => {
      console.log(data);
    });
  }, [])


  useEffect(() => {
    if (conversations && socketConnected) {
      conversations.forEach((room) => {
        socket.emit(SocketActions.join_room, { roomId: room._id })
      })
    }
  }, [conversations, socketConnected])

  return (
    <>
      <div className={`container ${thread ? 'container-open-thread' : ''}`}>
        <div className="search">
          <Search />
        </div>
        <div className="header">
          {selectedDirectMessage &&
            <div className="header__selected-contact">
              <NextImage src={selectedDirectMessage.avatar}
                alt={selectedDirectMessage.title}
                width={30}
                height={30}
              />
              <p>{selectedDirectMessage.title}</p>
            </div>
          }
        </div>
        <div className="sidebar" style={{ width: sidebarWidth ? sidebarWidth : 'auto' }} ref={sidebarRef}>
          <Sidebar
            conversations={conversations}
            onDirectMessageClick={(data) => {
              setSelectedDirectMessage(data)
            }} />
        </div>
        <div draggable className="resize"
          onDrag={handleDrag}
          onDragEnd={(e) => { }}
          onDragStart={(e) => {
            const img = new Image();
            img.src = 'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
            e.dataTransfer.setDragImage(img, 0, 0);
          }}>
        </div>
        <div className={`main-chat ${thread ? 'main-open-thread' : ''}`}>
          {selectedDirectMessage &&
            <MainContent
              onSendMessage={handleSendMessage}
              onOpenThread={(thread) => {
                const existingThread = threadsData.find(t => t.id === thread.id)
                if (!existingThread) {
                  setThread(thread);
                  setThreadsData([...threadsData, thread])
                } else {
                  setThread(thread);
                }
              }}
            />
          }
        </div>
        {thread !== null && <Thread thread={thread} onCloseThread={() => setThread(null)} onSubmit={handleSubmitReply} />}
      </div>
    </>
  );
}
