import express from "express"
var router = express.Router()
import { Message } from "../models/message"
import {
  getConversationInfo,
  createMessage,
  getUserConversations
} from "../services/message"
import _ from "lodash"

router.get("/conversations", async (req, res) => {
  const messages = await getUserConversations(req.user!.id);
  res.send(messages)
})

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
