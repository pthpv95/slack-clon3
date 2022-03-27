export interface IMessageReaction {
  messageId: string;
  name: string;
  symbol: string;
  by: string;
}

export interface IRemoveMessageReaction {
  id: string;
  messageId: string;
  conversationId: string;
  by: string;
}