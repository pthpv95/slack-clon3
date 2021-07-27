import express from "express"
import _ from "lodash"
import { createConversations, getUserConversations } from "../services/conversation"
var router = express.Router()

router.get("/", async (req, res) => {
  const messages = await getUserConversations(req.user!.id);
  res.send(messages)
})

router.post("/add-user", async (req, res) => {
  // const messages = await getUserConversations(req.user!.id);
  res.send({})
})

router.post("/", async (req, res) => {
  const body: any = _.pick(req.body, [
    "title",
    "createdBy",
  ])

  const message = await createConversations({
    title: body.title,
    createdBy: req.user!.id,
    memberIds: [req.user!.id]
  });
  res.send(message)
})

export default router
