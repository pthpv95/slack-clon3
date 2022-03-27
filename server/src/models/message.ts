import mongoose, { Schema, Document } from "mongoose"

export interface IReaction extends Document {
  name: string;
  symbol: string;
  by: string[]
}
export interface IMessage extends Document {
  text: string
  attachmentUrl: string
  conversationId: string
  type: number
  replies: number
  threadId?: string
  createdBy: string
  avatarUrl: string
  createdAt: Date
  reactions: IReaction[]
}

const messageReactionSchema = new Schema({
  name: {
    type: Schema.Types.String
  },
  symbol: {
    type: Schema.Types.String
  },
  by: [{
    type: Schema.Types.String
  }],
}, {
  toObject: {
    transform: (doc, ret) => {
      ret.id = doc._id;
      delete ret._id;
    }
  }
})

const MessageSchema = new Schema(
  {
    text: {
      type: String,
    },
    attachmentUrl: {
      type: String,
    },
    conversationId: {
      type: Schema.Types.String,
      required: true,
    },
    threadId: {
      type: Schema.Types.String,
    },
    type: {
      type: Number,
      required: true,
    },
    reactions: [messageReactionSchema],
    createdBy: {
      type: Schema.Types.String
    },
    createdAt: {
      type: Schema.Types.Date,
    },
  },
  {
    timestamps: true,
    toObject: {
      transform: (doc, ret) => {
        ret.id = doc._id;
        ret.timestamp = doc.createdAt;
        delete ret._id;
        delete ret.createdAt;
      }
    }
  }
)

const Message = mongoose.model<IMessage>("messages", MessageSchema)

export { Message }
