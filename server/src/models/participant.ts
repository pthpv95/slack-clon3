import mongoose, { Schema, Document } from "mongoose"

export interface IParticipant extends Document {
  text: string
  attachmentUrl: string
  conversationId: string
  type: number
  createdBy: string
  createdAt: Date
}

const ParticipantSchema = new Schema(
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
    type: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: Schema.Types.String,
    },
    createdAt: {
      type: Schema.Types.Date,
    },
  },
  { timestamps: true }
)

const Participant = mongoose.model<IParticipant>("participants", ParticipantSchema)

export { Participant }
