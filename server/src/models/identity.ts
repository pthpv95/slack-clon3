import mongoose, { Document, Schema } from "mongoose"
import bcrypt from 'bcryptjs'

export interface IIdentity extends Document {
  username: string
  password: string
}

const IdentitySchema = new Schema({
  username: {
    type: String,
    required: true,
    minlength: 2,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  token: {
    type: String
  }
})

IdentitySchema.pre('save', function (next) {
  var identity: any = this
  if (identity.isModified("password")) {
    bcrypt.genSalt(10, (_err: any, salt: any) => {
      bcrypt.hash(identity.password, salt, (_err: any, hash: any) => {
        identity.password = hash
        next()
      })
    })
  } else {
    next()
  }
})

var Identity = mongoose.model<IIdentity>("identity", IdentitySchema)

export { Identity }
