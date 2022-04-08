const { Router } = require("express");
const authorization = require("../authorization");
const router = Router();
const userController = require("../controllers/user");

router.get("/", userController.list);
router.post("/", authorization, userController.create);
router.delete("/:id", authorization, userController.delete);

module.exports = router;
