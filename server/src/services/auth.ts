import { Identity } from '../models/identity'
import { User } from '../models/user'
import bcrypt from 'bcryptjs'
import { IRegisterUserInput } from '../types/user/IRegisterUserInput'
import { ErrorDTO } from '../types/error/error'
import passport from 'passport'
const LocalStrategy = require('passport-local').Strategy

const registerUser = async (input: IRegisterUserInput) => {
  const identityDoc = new Identity({
    username: input.username,
    password: input.password,
  })

  const userExisted = await Identity.findOne({ username: input.username })
  if (userExisted) {
    throw new Error('Username existed')
  }

  const identity = await identityDoc.save()
  const user = new User({
    firstName: input?.firstName,
    lastName: input?.lastName,
    identityId: identity._id,
  })

  await user.save()

  return identity
}

const login = async (username: string, password: string) => {
  passport.use(
    new LocalStrategy(async (username: string, password, done) => {
      const identity = await Identity.findOne({ username })
      if (!identity) {
        throw new ErrorDTO('User not found')
      }

      try {
        const same = await bcrypt.compare(password, identity.password)
        if (same) {
          return done(null, identity)
        }
        return done(null, false)
      } catch (error) {
        throw new ErrorDTO('Invalid username/password')
      }
    })
  )

  // const identity = await Identity.findOne({ userName })
  // if(!identity){
  //   throw new ErrorDTO("User not found")
  // }

  // try {
  //   const same = await bcrypt.compare(password, identity.password)
  //   if(same){
  //     return 'Successful'
  //   }
  //   throw new ErrorDTO("Invalid username/password")
  // } catch (error) {
  //   throw new ErrorDTO("Invalid username/password")
  // }
}

export { registerUser, login }
