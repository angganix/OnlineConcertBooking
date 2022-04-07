const { Router } = require("express");
const router = Router();
const userController = require("../controllers/user");

router.get("/", userController.list);
router.post("/", userController.create);
router.delete("/:id", userController.delete);

module.exports = router;
