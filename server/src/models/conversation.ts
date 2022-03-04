import mongoose, { Schema, Document } from "mongoose"

interface IConversation extends Document {
  title: string
  memberIds: string[]
  createdBy: string
  createdAt: Date
}

export enum ConversationType {
  DirectMessage,
  Channel,
}

const ConversationSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  memberIds: [{
    type: String,
    required: true,
  }],
  createdBy: {
    type: Schema.Types.String,
    required: true,
  },
  createdAt: {
    type: Schema.Types.Number,
    default: Date.now(),
  },
  type: {
    type: Schema.Types.Number,
    required: true,
    default: ConversationType.DirectMessage
  },
}, {
  timestamps: true,
  toObject: {
    transform: (doc, ret) => {
      ret.id = doc._id;
      delete ret._id;
    }
  }
})

const Conversation = mongoose.model<IConversation>(
  "conversations",
  ConversationSchema
)

export { Conversation }
