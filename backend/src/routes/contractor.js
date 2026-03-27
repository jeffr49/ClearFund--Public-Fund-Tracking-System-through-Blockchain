const router = require("express").Router();
const multer = require("multer");

const upload = multer();

const {
  getContractorProjects,
  getProjectDetails,
  uploadProof,
  submitProof,
  getContractorTimeline
} = require("../controllers/contractorController");

router.get("/projects", getContractorProjects);
router.get("/project/:id", getProjectDetails);
router.get("/events/:projectId", getContractorTimeline);
router.post("/upload", upload.single("file"), uploadProof);
router.post("/submit-proof", submitProof);

module.exports = router;
