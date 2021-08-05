import mongoose, { Document, Schema } from "mongoose"

export interface IUser extends Document {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl: string
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
  avatarUrl: {
    type: String,
    minlength: 2,
  },
  identityId: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  toObject: {
    transform: (doc, ret) => {
      ret.id = doc._id;
      ret.timestamp = doc.createdAt;
      // ret.displayName = doc.firstName + ' ' + doc.lastName
      delete ret._id;
      delete ret.createdAt;
    }
  }
})

var User = mongoose.model<IUser>("users", UserSchema)

export { User }
