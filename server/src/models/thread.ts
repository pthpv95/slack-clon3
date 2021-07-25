import mongoose, { Schema, Document } from "mongoose"

interface IThread extends Document {
  title: string
  memberIds: string[]
  createdBy: string
  createdAt: Date
}

const ThreadSchema = new Schema({
  messageId: {
    type: String,
    required: true,
  },
  subMessageIds: [{
    type: String,
    required: true,
  }],
  createdAt: {
    type: Schema.Types.Number,
    default: Date.now(),
  },
})

const Thread = mongoose.model<IThread>(
  "threads",
  ThreadSchema
)

export { Thread }
