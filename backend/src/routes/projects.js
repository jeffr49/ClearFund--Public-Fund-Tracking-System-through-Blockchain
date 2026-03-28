const router = require("express").Router();

const {
  createProject,
  getProjectsOverview,
  getProjects,
  getProjectById
} = require("../controllers/projectController");

router.post("/create", createProject);
router.get("/overview", getProjectsOverview);
router.get("/", getProjects);
router.get("/:id", getProjectById);

module.exports = router;