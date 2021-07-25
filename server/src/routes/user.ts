import express, { Request } from "express";
import { getUser, getUserContacts, getUserByIdentityId } from "../services/user";

var router = express.Router()
router.get("/me", async (req: Request, res) => {
  try {
    const user = await getUser(req.user!.id)
    res.send(user)
  } catch (error) {
    res.status(404).send(error);  
  }
})

router.get("/:userId", async (req, res) => {
  const userId = req.params.userId
  var user = await getUser(userId) || []
  res.send(user)
})

router.get("/:userId/contacts", async (req, res) => {
  const userId = req.params.userId
  var contacts = (await getUserContacts(userId)) || []
  res.send(contacts)
})

export default router
