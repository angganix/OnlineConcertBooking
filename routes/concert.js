const { Router } = require("express");
const authorization = require("../authorization");
const router = Router();
const concertController = require("../controllers/concert");

router.get("/", concertController.list);
router.get("/:id", concertController.show);
router.post("/", authorization, concertController.create);
router.put("/:id", authorization, concertController.update);
router.delete("/:id", authorization, concertController.delete);

module.exports = router;
