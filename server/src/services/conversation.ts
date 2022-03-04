import { publish, events } from '../helpers/pub-sub'
import { Conversation, ConversationType } from '../models/conversation'
import { UserConversation } from '../models/userConversation'

export interface CreateConversationInput {
  title: string
  type: ConversationType
  description?: string
  createdBy: string
  isPrivate: boolean
  memberIds: string[]
}

const createConversations = async (input: CreateConversationInput) => {
  const conversations = new Conversation(input)
  const conversions = await conversations.save()
  const userConversation = await UserConversation.findOne({
    userId: input.createdBy,
  })
  if (!userConversation) {
    throw new Error('user conversation not found')
  }
  userConversation.set({
    conversationIds: [...userConversation.conversationIds, conversations.id],
  })
  await userConversation.save()
  return conversions
}


const addUserToConversation = async (userId: string, conversationId: string) => {
  const conversation = await Conversation.findById(conversationId)
  if (!conversation) {
    throw new Error('Conversation not found')
  }

  const userConversation = await UserConversation.findOne({
    userId,
  })

  if (!userConversation) {
    throw new Error('user conversation not found')
  }

  conversation.set({
    memberId: [...conversation.memberIds, userId]
  })

  userConversation.set({
    conversationIds: [...userConversation.conversationIds, conversationId],
  })

  await userConversation.save()
  await conversation.save()
  publish(events.ON_ADD_USER_TO_CONVERSATION, {
    userId,
    roomId: conversationId
  });

  return;
}

const getUserConversations = async (id: string) => {
  const userConversations = await UserConversation.findOne({
    userId: id,
  })
  const conversions = await Conversation.find({
    _id: { $in: userConversations?.conversationIds },
  })

  return conversions.map((c) => ({
    ...c.toObject(),
    avatar: 'https://picsum.photos/200',
  }))
}

export { createConversations, getUserConversations, addUserToConversation }
