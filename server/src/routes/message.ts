import express from "express"
import _ from "lodash"
import {
  createMessage, 
  getDirectMessage,
  getReplies
} from "../services/message"
var router = express.Router()

router.post("/:conversationId/create", async (req, res) => {
  const body: any = _.pick(req.body, [
    "text",
    "attachmentUrl",
    "type",
    "createdBy",
  ])

  const conversationId = req.params.conversationId
  const message = await createMessage({ ...body, conversationId })
  res.send(message)
})

router.post("/direct", async (req, res) => {
  try {
    const cursor: any = req.body.cursor
    const limit = req.body.limit
    // const contactId = req.body.contactId
    const conversationId = req.body.conversationId

    const data = await getDirectMessage(
      req.user!.id,
      conversationId,
      cursor,
      limit
    )
    res.send(data)
  } catch (error) {
    console.log(error);
    res.status(400).send(error)
  }
})

router.get("/thread/:threadId", async (req, res) => {
  try {
    const threadId = req.params.threadId
    const data = await getReplies(threadId)
    res.send(data)
  } catch (error) {
    console.log(error);
    res.status(400).send(error)
  }
})

export default router
