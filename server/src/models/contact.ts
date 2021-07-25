import mongoose, { Schema, Document } from "mongoose"

export interface IContact extends Document {
  userId: string;
  contacts: string[];
}

const ContactSchema = new Schema({
  userId: {
    type: String,
  },
  contacts: [{ type: String }],
  channels: [{ type: String }]
})

const Contact = mongoose.model<IContact>("contacts", ContactSchema)

export { Contact }
