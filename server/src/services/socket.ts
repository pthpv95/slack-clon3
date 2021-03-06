// import { createAdapter } from '@socket.io/redis-adapter'
import { createServer } from 'http'
// import { createClient } from 'redis'
import { Server, Socket } from 'socket.io'
import { SocketActions, SocketEvents } from '../constants'
import { events, register } from '../helpers/pub-sub';
import {
  createMessage,
  CreateMessageInput,
  CreateMessageInThreadInput,
  readMessage,
  removeMessageReaction,
  updateMessageReaction,
} from '../services/message'
import { IMessageReaction, IRemoveMessageReaction } from '../types/message/MessageReaction';
import { IReadMessage } from '../types/message/IReadMessage'

const app = require('express')()
const server = createServer(app)
console.log(process.env.ALLOW_ORIGIN_HOST)
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOW_ORIGIN_HOST,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// const pubClient = createClient({
//   host: 'localhost',
//   port: 6379,
//   auth_pass: '123456',
// })
// const subClient = pubClient.duplicate()
// io.adapter(createAdapter(pubClient, subClient))

io.on('connection', (socket: Socket) => {
  // socket.emit(SocketEvents.new_message, 'welcome ...');
  socket.on(SocketActions.send_message, async (data, cb) => {
    const userId = data.userId
    const input: CreateMessageInput = {
      text: data.text,
      attachmentUrl: data.attachmentUrl,
      type: data.text ? 0 : 1,
      createdBy: userId, // TODO: get from claim later
      conversationId: data.conversationId,
    }
    const message = await createMessage(input)
    io.emit(SocketEvents.new_message, message.toObject())
    cb && cb()
  })

  socket.on(SocketActions.send_message_in_thread, async (data, cb) => {
    const userId = data.userId
    const input: CreateMessageInThreadInput = {
      text: data.text,
      attachmentUrl: data.attachmentUrl,
      type: data.text ? 0 : 1,
      createdBy: userId, // TODO: get from claim later
      conversationId: data.conversationId,
      threadId: data.threadId,
    }
    const message = await createMessage(input)
    io.emit(SocketEvents.new_message, message.toObject())
    cb && cb()
  })

  socket.on(SocketEvents.join_room, (data) => {
    console.log('on join room.', data)
    socket.join(data.roomId)
  })

  socket.on(SocketEvents.read_message, async (data: IReadMessage) => {
    await readMessage(data)
    io.emit(SocketEvents.message_seen, data)
  })

  socket.on(SocketActions.typing_message, (data) => {
    socket.emit(SocketEvents.typing, data)
  })

  socket.on(SocketActions.stop_typing_message, (data) => {
    socket.emit(SocketEvents.stop_typing, data)
  })

  socket.on(SocketActions.react_message, async (data: IMessageReaction, cb) => {
    const result = await updateMessageReaction(data)
    console.log('emit message reaction');

    io.emit(SocketEvents.message_reacted, result)
  })

  socket.on(SocketActions.remove_reaction, async (data: IRemoveMessageReaction, cb) => {
    const result = await removeMessageReaction(data)
    io.emit(SocketEvents.reaction_removed, result)
  })

  // events
  // register(events.ON_ADD_USER_TO_CONVERSATION, (data) => {
  //   // Handle notify user added to group
  //   console.log(data);
  //   socket.join(data.roomId)
  // });

  //
  socket.on('disconnect', () => {
    console.log('User was disconnected!')
  })
})

export { app, server }
