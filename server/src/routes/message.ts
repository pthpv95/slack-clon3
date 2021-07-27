import express from "express"
import _ from "lodash"
import {
  createMessage, getConversationInfo
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

router.post("/", async (req, res) => {
  try {
    const cursor: any = req.body.cursor
    const limit = req.body.limit
    const contactId = req.body.contactId
    const conversationId = req.body.conversationId

    const data = await getConversationInfo(
      contactId,
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

export default router
