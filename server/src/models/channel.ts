import mongoose, { Schema, Document } from "mongoose"

interface IChannel extends Document {
  title: string
  memberIds: string[]
  createdBy: string
  createdAt: Date
}

const ChannelSchema = new Schema({
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
    default: 0 // private: 0 | group: 1
  },
})

const Channel = mongoose.model<IChannel>(
  "channels",
  ChannelSchema
)

export { Channel }
