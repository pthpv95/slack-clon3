import express from "express"
import _ from "lodash"
import { addUserToConversation, createConversations, getUserConversations } from "../services/conversation"
let router = express.Router()

router.get("/", async (req, res) => {
  let messages = await getUserConversations(req.user!.id);
  res.send(messages)
})

router.post("/add-user/:userId/:conversationId", async (req, res) => {
  await addUserToConversation(req.params.userId, req.params.conversationId);
  res.status(200).send({})
})

router.post("/", async (req, res) => {
  let body: any = _.pick(req.body, [
    "title",
    "createdBy",
    "type",
    "isPrivate"
  ])

  let message = await createConversations({
    title: body.title,
    createdBy: req.user!.id,
    memberIds: [req.user!.id],
    type: body.type,
    isPrivate: body.isPrivate
  });
  res.send(message)
})

export default router
