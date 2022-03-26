import express, { Request } from "express";
import { validateMongoId } from "../helpers";
import { getUser, getUserContacts } from "../services/user";

let router = express.Router()
router.get("/me", async (req: Request, res) => {
  try {
    let user = await getUser(req.user!.id)
    res.send(user)
  } catch (error) {
    res.status(404).send(error);
  }
})

router.get("/contacts", async (req, res) => {
  let contacts = (await getUserContacts(req.user!.id)) || []
  res.send(contacts)
})

router.get("/:userId", async (req, res, next) => {
  let userId = req.params.userId
  validateMongoId(userId);
  let user = await getUser(userId) || []
  res.send(user)
})

export default router
