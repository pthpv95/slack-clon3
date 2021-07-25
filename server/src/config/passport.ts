import jwtSecret from "./jwtConfig"
import bcrypt from "bcrypt"
import { User } from "../models/user"
import { Identity } from "../models/identity"
import passport from "passport"
import localStrategy from "passport-local"
import passportStrategy from "passport-jwt"

passport.use(
  "register",
  new localStrategy.Strategy(
    {
      usernameField: "username",
      passwordField: "password",
      session: false,
    },
    async (username, password, done) => {
      try {
        const identityDoc = new Identity({ username, password })

        const userExisted = await Identity.findOne({ username })
        if (userExisted) {
          console.log("username already taken")
          return done(null, false, { message: "username already taken" })
        }

        const identity = await identityDoc.save()
        const user = new User({
          identityId: identity._id,
        })

        await user.save()
        console.log("user created")
        // note the return needed with passport local - remove this return for passport JWT to work
        return done(null, user)
      } catch (error) {
        done(error)
      }
    }
  )
)

passport.use(
  "login",
  new localStrategy.Strategy(
    {
      usernameField: "username",
      passwordField: "password",
      session: false,
    },
    async (username, password, done) => {
      try {
        const identity = await Identity.findOne({ username })
        if (!identity) {
          return done(null, false, { message: "Invalid username" })
        }

        const same = await bcrypt.compare(password, identity.password)
        if (!same) {
          console.log("passwords do not match")
          return done(null, false, { message: "passwords do not match" })
        }

        return done(null, identity)
      } catch (error) {
        done(error)
      }
    }
  )
)

const opts = {
  jwtFromRequest: passportStrategy.ExtractJwt.fromAuthHeaderWithScheme(
    "Bearer"
  ),
  secretOrKey: jwtSecret.secret,
}

// passport.use(
//   "jwt",
//   new passportStrategy.Strategy(opts, (jwt_payload, done) => {
//     try {
//       User.findOne({
//         username: jwt_payload.id,
//       }).then((user) => {
//         if (user) {
//           console.log("user found in db in passport")
//           // note the return removed with passport JWT - add this return for passport local
//           done(null, user)
//         } else {
//           console.log("user not found in db")
//           done(null, false)
//         }
//       })
//     } catch (err) {
//       done(err)
//     }
//   })
// )

passport.use(
  new passportStrategy.Strategy(opts, async (token, done) => {
    try {
      return done(null, token)
    } catch (error) {
      done(error)
    }
  })
)
