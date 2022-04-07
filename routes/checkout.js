const { Router } = require("express");
const router = Router();
const checkoutController = require("../controllers/checkout");

router.get("/", checkoutController.list);
router.get("/:id", checkoutController.show);
router.post("/", checkoutController.create);

module.exports = router;
