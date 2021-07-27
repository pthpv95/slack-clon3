import _ from 'lodash'
import { Conversation } from "../models/conversation"
import { IMessage, Message } from "../models/message"
import { ReadReceipt } from "../models/readReceipt"
import { UserConversation } from '../models/userConversation'
import { IReadMessage } from "../types/message/IReadMessage"

class ConversationDTO {
  constructor(id: string, title: string, messages: MessageDTO[] = [], nextCursor: string) {
    this.id = id
    this.title = title
    this.messages = messages
    this.nextCursor = nextCursor
  }

  id: string
  title: string
  nextCursor: string;
  messages: MessageDTO[]
}

class MessageDTO {
  constructor(
    id: string,
    text: string,
    attachmentUrl: string,
    messageType: number,
    createdBy: string,
    sentAt: Date,
    isResponse: boolean,
    seen: boolean
  ) {
    this.id = id
    this.text = text
    this.attachmentUrl = attachmentUrl
    this.messageType = messageType
    this.createdBy = createdBy
    this.sentAt = sentAt
    this.isResponse = isResponse
    this.seen = seen
  }

  id: string
  text: IMessage["text"]
  attachmentUrl: IMessage["attachmentUrl"]
  messageType: IMessage["type"]
  createdBy: IMessage["createdBy"]
  sentAt: IMessage["createdAt"]
  isResponse: boolean
  seen: boolean
}

export interface CreateMessageInput {
  id: string
  text: string
  attachmentUrl: string
  type: number
  createdBy: string
  timestamp: Date
  conversationId: string
}

const getConversationInfo = async (
  contactId: string,
  conversationId: string,
  cursor?: number,
  limit: number = 3
) => {
  var conversation = await Conversation.findById(conversationId)
  if (conversation) {
    let predicate: any = {
      conversationId,
    }
    if (cursor) {
      predicate = {
        ...predicate,
        _id: { $lt: cursor },
      }
    }

    var messages = await Message.find({ ...predicate })
      .sort({ _id: -1 })
      .limit(limit)

    let nextCursor: any = null
    if (messages) {
      if (messages.length >= limit) {
        nextCursor = _.last(messages)?.id
      }

      var lastReadMessage = await ReadReceipt.findOne({conversationId})

      const messagesDTO = _.map(messages, (message) => {
        const seen = message.id == lastReadMessage?.messageId

        return new MessageDTO(
          message.id,
          message.text,
          message.attachmentUrl,
          message.type,
          message.createdBy,
          message.createdAt,
          message.createdBy === contactId,
          seen
        )
      })
      return new ConversationDTO(
        conversation.id,
        conversation.title,
        _.orderBy(messagesDTO, m => m.sentAt),
        nextCursor
      )
    }

    return new ConversationDTO(conversation.id, conversation.title, [], nextCursor)
  }

  throw new Error("Conversation not found")
}

const readMessage = async (input: IReadMessage) => {
  await ReadReceipt.findOneAndDelete({
    conversationId: input.conversationId,
  }, (err, doc) => {
    console.log(err, doc);
  })
  
  const readReceipt = new ReadReceipt({
    conversationId: input.conversationId,
    messageId: input.messageId,
    seenerId: input.seenerId,
  })

  await readReceipt.save()
}

const createMessage = async (input: CreateMessageInput): Promise<any> => {
  var message = new Message(input)
  await message.save()
  return message
}

var createConversation = async (
  title: string,
  createdBy: string,
  memberIds: string[]
) => {
  var conversation = new Conversation({
    title,
    createdBy,
    memberIds,
  })

  await conversation.save()
  return conversation
}


export { 
  getConversationInfo,
  createMessage, 
  createConversation, 
  readMessage,
}
