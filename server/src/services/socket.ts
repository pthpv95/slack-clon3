import { SocketEvents, SocketActions } from "../constants"
import { createMessage, CreateMessageInput } from "../services/message"
import { IReadMessage } from "../types/message/IReadMessage"
import { readMessage } from "../services/message"
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { generateUniqueId } from "../helpers";

const app = require("express")();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ["GET", "POST"],
    credentials: true
  }
});

const pubClient = createClient({ host: "localhost", port: 6379, auth_pass: '123456' });
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));

io.on("connection", (socket: Socket) => {
  socket.emit(SocketEvents.new_message, 'welcome ...');

  socket.on(SocketActions.on_send_message, async (data, cb) => {
    const userId = data.userId;
    const input: CreateMessageInput = {
      id: generateUniqueId(),
      text: data.text,
      attachmentUrl: data.attachmentUrl,
      type: data.text ? 0 : 1,
      createdBy: userId, // TODO: get from claim later
      conversationId: data.conversationId,
      timestamp: new Date(),
    }
    io.to(input.conversationId).emit(SocketEvents.new_message, input)

    // const message = await createMessage(input)
    // const response = {
    //   id: message._id,
    //   text: data.text,
    //   attachmentUrl: data.attachmentUrl,
    //   messageType: message.type,
    //   senderId: userId,
    //   seen: true,
    //   sentBy: userId,
    //   conversationId: data.conversationId,
    //   sentAt: message.createdAt
    // }
    // io.emit(SocketEvents.new_message, data)
    cb()
  })

  socket.on(SocketEvents.on_join_room, (data) => {
    console.log('on join room.', data);
    socket.join(data.roomId);
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

  socket.on("disconnect", () => {
    console.log("User was disconnected!")
  })
})

export { app, server }
