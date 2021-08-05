import mongoose, { Schema, Document } from "mongoose"

interface IThread extends Document {
  id: string
  messageIds: string[]
  createdAt: Date
}

const ThreadSchema = new Schema({
  messageIds: [{
    type: String,
    required: true,
  }],
  createdAt: {
    type: Schema.Types.Number,
  },
},{
  timestamps: true,
  toObject: {
    transform: (doc, ret) => {
      ret.id = doc._id;
      delete ret._id;
    }
  }
})

const Thread = mongoose.model<IThread>(
  "threads",
  ThreadSchema
)

export { Thread }
