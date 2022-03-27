import dotenv from 'dotenv'
dotenv.config()
import bodyParser from 'body-parser'
import cors from 'cors'
import 'express'
import 'express-async-errors';
import passport from 'passport'
import './config/passport'
import './db/mongoose'
import auth from './routes/auth'
import messages from './routes/message'
import users from './routes/user'
import conversations from './routes/conversation'
import healthcheck from './routes/healthcheck'
import { server, app } from './services/socket'
import { errorHandler } from './middlewares/error-handler'

declare global {
  namespace Express {
    interface User {
      id: string
      username: string
    }
    interface Request {
      user?: User
    }
  }
}
app.use(cors({
  origin: process.env.ALLOW_ORIGIN_HOST,
  credentials: true
}))
app.use(bodyParser.json())
app.use(passport.initialize())

app.use('/api/auth', auth)
app.use(
  '/api/messages',
  passport.authenticate('jwt', { session: false, authInfo: true }),
  messages
)
app.use(
  '/api/users',
  passport.authenticate('jwt', { session: false, authInfo: true }),
  users
)
app.use(
  '/api/conversations',
  passport.authenticate('jwt', { session: false, authInfo: true }),
  conversations
)
app.use('/healthcheck', healthcheck)
app.use(errorHandler)
const port = process.env.PORT || 3001

server.listen(port, () => {
  console.log(`Chat app listening at http://localhost:${port}`)
})
