import React, { useEffect, useState } from 'react'
import Avatar from '../shared/avatar'
import Input from '../shared/input'
import Messages from '../shared/messages'

const Thread = ({
  thread,
  newReply,
  isLoading,
  onSubmit,
  onMoreAction,
  onCloseThread,
}) => {
  const [reply, setReply] = useState('')
  const [messages, setMessages] = useState([])

  useEffect(() => {
    // init replies
    setMessages(thread.replies)
  }, [thread])

  useEffect(() => {
    // update message when new reply's coming
    if (newReply) {
      setMessages([...thread.replies, newReply])
    }
  }, [newReply, thread])

  return (
    <div className="thread">
      <div className="thread__heading">
        <h4>Thread</h4>
        <button className="btn btn-unstyled" onClick={onCloseThread}>
          X
        </button>
      </div>
      <div className="thread__sub-heading">
        <Avatar src={thread?.avatarUrl} />
        <div className="thread__sub-heading--text">
          <p className="thread__sub-heading--owner">{thread?.createdBy}</p>
          <p>{thread?.title}</p>
        </div>
      </div>
      {messages.length > 0 && (
        <div className="thread__num-replies">
          <span>{messages.length} replies</span>
        </div>
      )}
      <div className="thread">
        <div className="thread__content">
          <Messages
            messages={messages}
            isInThread={true}
            handleMoreAction={onMoreAction}
          />
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit(reply, thread)
          setReply('')
        }}
      >
        <div className="thread__input-box">
          <Input
            autoFocus={true}
            value={reply}
            placeholder="Reply..."
            onChange={(e) => {
              setReply(e.target.value)
            }}
          />
        </div>
      </form>
    </div>
  )
}

export default Thread
