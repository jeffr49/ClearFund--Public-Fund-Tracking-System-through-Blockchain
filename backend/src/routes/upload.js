const router = require("express").Router();
const multer = require("multer");

const upload = multer();

const { uploadProof } = require("../controllers/uploadController");

router.post("/proof", upload.single("file"), uploadProof);

module.exports = router;