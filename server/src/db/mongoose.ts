import mongoose from 'mongoose'
mongoose.Promise = global.Promise
// mongoose.set("debug", true)
const url = `mongodb://${process.env.MONGODB_HOST}:27017`
mongoose.connect(url, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  user: process.env.MONGODB_USER,
  pass: process.env.MONGODB_PASS,
  dbName: 'chatapp',
})

var db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

export default { mongoose }
