const { Router } = require("express");
const router = Router();
const hallController = require("../controllers/hall");

router.get("/", hallController.list);
router.get("/:id", hallController.show);
router.post("/", hallController.create);
router.put("/:id", hallController.update);
router.delete("/:id", hallController.delete);

module.exports = router;
