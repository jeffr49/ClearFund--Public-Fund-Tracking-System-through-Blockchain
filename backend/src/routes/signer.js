const router = require("express").Router();
const { 
  getSignerTasks, 
  getAssignedProjects, 
  getApproverDecisions, 
  getApproverHistory 
} = require("../controllers/signerController");

router.get("/tasks", getSignerTasks);
router.get("/assigned", getAssignedProjects);
router.get("/decisions", getApproverDecisions);
router.get("/history", getApproverHistory);

module.exports = router;