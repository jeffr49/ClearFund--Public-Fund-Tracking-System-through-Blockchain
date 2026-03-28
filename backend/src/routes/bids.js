const router = require("express").Router();

const {
  submitBid,
  selectBid,
  getMyBids,
  getProjectBids
} = require("../controllers/bidController");

// Get project bids
router.get("/project/:projectId", getProjectBids);

// Submit bid
router.post("/submit", submitBid);

// Get my bids
router.get("/my", getMyBids);

// Select contractor + deploy contract
router.post("/select", selectBid);

module.exports = router;