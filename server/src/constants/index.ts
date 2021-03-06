export const SocketEvents = {
  new_message: "new_message",
  read_message: "read_message",
  message_seen: "message_seen",
  typing: "typing",
  stop_typing: "stop_typing",
  join_room: "join_room",
  message_reacted: 'message_reacted',
  reaction_removed: 'reaction_removed'
}

export const SocketActions = {
  send_message: "send_message",
  send_message_in_thread: "send_message_in_thread",
  react_message: "react_message",
  read_message: "read_message",
  typing_message: "typing_message",
  stop_typing_message: "stop_styping_message",
  remove_reaction: "remove_reaction",
}