const router = require("express").Router();
const { getSignerTasks } = require("../controllers/signerController");

router.get("/tasks", getSignerTasks);

module.exports = router;