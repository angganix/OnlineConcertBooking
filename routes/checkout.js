const { Router } = require("express");
const authorization = require("../authorization");
const router = Router();
const checkoutController = require("../controllers/checkout");

router.get("/", authorization, checkoutController.list);
router.get("/:id", authorization, checkoutController.show);
router.post("/", authorization, checkoutController.create);
router.put("/payment/:id", authorization, checkoutController.payorder);

module.exports = router;
