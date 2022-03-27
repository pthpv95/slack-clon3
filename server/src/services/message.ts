import _ from 'lodash'
import { NotFoundError } from '../errors/not-found-error'
import { Conversation } from '../models/conversation'
import { IMessage, IReaction, Message } from '../models/message'
import { ReadReceipt } from '../models/readReceipt'
import { User } from '../models/user'
import { IMessageReaction } from '../types/message/IReactMessage'
import { IReadMessage } from '../types/message/IReadMessage'
import { UserInfo } from './user'

class ConversationDTO {
  constructor(
    id: string,
    title: string,
    messages: MessageDTO[] = [],
    nextCursor: string,
    members: UserInfo[]
  ) {
    this.id = id
    this.title = title
    this.messages = messages
    this.nextCursor = nextCursor
    this.members = members
  }

  id: string
  title: string
  nextCursor: string
  messages: MessageDTO[]
  members: UserInfo[]
}

class ReactionDTO {
  constructor(public name: string, public symbol: string, public by: string[]) {
    this.symbol = symbol
    this.name = name
    this.by = by
  }
}

class MessageDTO {
  constructor(
    id: string,
    text: string,
    attachmentUrl: string,
    messageType: number,
    createdBy: string,
    timestamp: Date,
    reactions: ReactionDTO[],
    replies?: number,
  ) {
    this.id = id
    this.text = text
    this.attachmentUrl = attachmentUrl
    this.messageType = messageType
    this.createdBy = createdBy
    this.timestamp = timestamp
    this.replies = replies
    this.reactions = reactions
  }

  id: string
  text: IMessage['text']
  attachmentUrl: IMessage['attachmentUrl']
  messageType: IMessage['type']
  replies?: IMessage['replies']
  createdBy: IMessage['createdBy']
  timestamp: IMessage['createdAt']
  reactions: ReactionDTO[]
}

export interface CreateMessageInput {
  text: string
  attachmentUrl: string
  type: number
  createdBy: string
  conversationId: string
}

export interface CreateMessageInThreadInput extends CreateMessageInput {
  threadId: string
}

const getDirectMessage = async (
  userId: string,
  conversationId: string,
  cursor?: number,
  limit: number = 3
) => {
  let conversation = await Conversation.findById(conversationId)
  if (conversation) {
    let predicate: any = {
      conversationId,
      threadId: null,
    }
    if (cursor) {
      predicate = {
        ...predicate,
        _id: { $lt: cursor },
      }
    }

    const queryMembers = await User.find({
      _id: { $in: conversation.memberIds },
    })

    const members: UserInfo[] = queryMembers.map((item) => {
      return new UserInfo(
        item.id,
        item.firstName,
        item.lastName,
        item.email,
        item.avatarUrl
      )
    })

    const messages = await Message.find({ ...predicate })
      .sort({ _id: -1 })
      .limit(limit)

    let nextCursor: any = null
    if (messages) {
      if (messages.length === limit) {
        nextCursor = _.last(messages)?.id
      }

      const messagesDTO = await Promise.all(
        _.map(messages, async (message) => {
          const replies = await Message.countDocuments({
            threadId: message.id,
            conversationId,
          })
          return new MessageDTO(
            message.id,
            message.text,
            message.attachmentUrl,
            message.type,
            message.createdBy,
            message.createdAt,
            message.reactions.map(reaction => reaction.toObject()) || [],
            replies
          )
        })
      )
      return new ConversationDTO(
        conversation.id,
        conversation.title,
        _.orderBy(messagesDTO, (m) => m.timestamp),
        nextCursor,
        members
      )
    }

    return new ConversationDTO(
      conversation.id,
      conversation.title,
      [],
      nextCursor,
      members
    )
  }

  throw new Error('Conversation not found')
}

const getReplies = async (threadId: string) => {
  const messages = await Message.find({ threadId })
  return _.map(messages, (message) => {
    return new MessageDTO(
      message.id,
      message.text,
      message.attachmentUrl,
      message.type,
      message.createdBy,
      message.createdAt,
      []
    )
  })
}

const readMessage = async (input: IReadMessage) => {
  await ReadReceipt.findOneAndDelete(
    {
      conversationId: input.conversationId,
    }
  )

  const readReceipt = new ReadReceipt({
    conversationId: input.conversationId,
    messageId: input.messageId,
    seenerId: input.seenerId,
  })

  await readReceipt.save()
}

const createMessage = async (input: CreateMessageInput): Promise<any> => {
  const message = new Message(input)
  await message.save()
  return message
}

let createConversation = async (
  title: string,
  createdBy: string,
  memberIds: string[]
) => {
  let conversation = new Conversation({
    title,
    createdBy,
    memberIds,
  })

  await conversation.save()
  return conversation
}

let updateMessageReaction = async (input: IMessageReaction) => {
  let message = await Message.findOne({ _id: input.messageId })
  if (!message) {
    throw new NotFoundError('Message not found')
  }


  if (!message.reactions?.length) {
    await message.updateOne({
      reactions: [{
        by: [input.by],
        name: input.name,
        symbol: input.symbol
      }]
    });
  } else {
    let isReactingOnExistingOne = message.reactions.some(reaction => reaction.name === input.name);
    if (isReactingOnExistingOne) {
      let existingReaction = message.reactions.find(reaction => reaction.name === input.name);
      if (existingReaction) {
        existingReaction.by = [...existingReaction.by, input.by]
        await message.save();
      }
    } else {
      await message.updateOne({
        reactions: [...message.reactions, {
          by: [input.by],
          name: input.name,
          symbol: input.symbol
        }]
      })
    }
  }

  let updatedMessage = await Message.findOne({ _id: input.messageId }, { reactions: 1 })

  return {
    ...input,
    reactions: updatedMessage?.reactions.map(reaction => reaction.toObject()),
    conversationId: message.conversationId
  }
}

export {
  getDirectMessage,
  createMessage,
  createConversation,
  readMessage,
  getReplies,
  updateMessageReaction
}
