import express from 'express'
var router = express.Router()
router.get("/", async (req, res) => {
  res.send('Service is running')
})

export default router