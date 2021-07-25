import mongoose, { Document, Schema } from "mongoose"

export interface IUser extends Document {
  id: string;
  email: string
  firstName: string
  lastName: string
}

const UserSchema = new Schema({
  firstName: {
    type: String,
    minlength: 2,
  },
  lastName: {
    type: String,
    minlength: 2,
  },
  email: {
    type: String,
    minlength: 2,
  },
  identityId: {
    type: String,
    required: true
  }
})

var User = mongoose.model<IUser>("users", UserSchema)

export { User }
