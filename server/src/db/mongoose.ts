import mongoose from "mongoose"
mongoose.Promise = global.Promise
// mongoose.set("debug", true)

const url = "mongodb://localhost:27017/chatapp"

mongoose.connect(url, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
})

var db = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB connection error:"))

export default { mongoose }
