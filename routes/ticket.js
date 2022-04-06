const { Router } = require("express");
const router = Router();
const ticketController = require("../controllers/ticket");

router.get("/", ticketController.list);
router.get("/:id", ticketController.show);

module.exports = router;
