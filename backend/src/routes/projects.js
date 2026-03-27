const router = require("express").Router();

const {
  createProject,
  getProjects,
  getProjectById
} = require("../controllers/projectController");

// Create project
router.post("/create", createProject);

// Get all
router.get("/", getProjects);

// Get one
router.get("/:id", getProjectById);

module.exports = router;