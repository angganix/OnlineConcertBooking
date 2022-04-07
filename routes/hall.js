const { Router } = require("express");
const router = Router();
const hallController = require("../controllers/hall");
const authorization = require("../authorization");

/**
 * Public routes
 */
router.get("/", hallController.list);
router.get("/:id", hallController.show);

/**
 * routes yang di protect dengan
 * middleware authorization
 */
router.post("/", authorization, hallController.create);
router.put("/:id", authorization, hallController.update);
router.delete("/:id", authorization, hallController.delete);

module.exports = router;
