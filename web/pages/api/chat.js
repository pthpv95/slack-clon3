import { fetchWrapper } from '../../hooks/fetchWrapper'

const getUserConversation = () => {
  return fetchWrapper('/messages/conversations', 'GET')
}

const getDirectMessage = ({ conversationId, cursor, limit = 10 }) => {
  return fetchWrapper('/messages/direct', 'POST', {
    conversationId,
    limit,
    cursor,
  })
}

const getReplies = (threadId) => {
  return fetchWrapper(`/messages/thread/${threadId}`, 'GET')
}

export { getUserConversation, getDirectMessage, getReplies }
