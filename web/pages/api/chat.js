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

const addUserToGroup = (userId, conversationId) => {
  return fetchWrapper(`/conversations/add-user/${userId}/${conversationId}`, 'POST', {
    conversationId,
    limit,
    cursor,
  })
}

const createConversation = (payload) => {
  return fetchWrapper(`/conversations`, 'POST', payload)
}

export { getUserConversation, getDirectMessage, getReplies, addUserToGroup, createConversation }
