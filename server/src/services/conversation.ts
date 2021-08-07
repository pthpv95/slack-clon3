import { Conversation } from '../models/conversation'
import { UserConversation } from '../models/userConversation'

export interface CreateConversationInput {
  title: string
  createdBy: string
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

export { createConversations, getUserConversations }
