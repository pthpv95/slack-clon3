import mongoose from 'mongoose'
mongoose.Promise = global.Promise
// mongoose.set("debug", true)
const url = process.env.MONGODB_URL!;
mongoose.connect(url, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  dbName: 'slack-db'
})

var db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

export default { mongoose }
