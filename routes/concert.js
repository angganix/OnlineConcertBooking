const { Router } = require("express");
const router = Router();
const concertController = require("../controllers/concert");

router.get("/", concertController.list);
router.get("/:id", concertController.show);
router.post("/", concertController.create);
router.put("/:id", concertController.update);
router.delete("/:id", concertController.delete);

module.exports = router;
