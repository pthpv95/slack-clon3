import mongoose, { Schema, Document } from "mongoose"

interface IUserConversation extends Document {
  conversationIds: string[]
  userId: string
}

const UserConversationSchema = new Schema({
  conversationIds: [{ type: String }],
  userId: {
    type: String,
    required: true,
  },
})

const UserConversation = mongoose.model<IUserConversation>(
  "user_conversation",
  UserConversationSchema
)

export { UserConversation }
