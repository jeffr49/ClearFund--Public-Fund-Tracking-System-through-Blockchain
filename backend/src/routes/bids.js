const router = require("express").Router();

const {
  submitBid,
  selectBid,
  getMyBids,
  getProjectBids,
  updateBid,
  deleteBid
} = require("../controllers/bidController");

// Get project bids
router.get("/project/:projectId", getProjectBids);

// Submit bid
router.post("/submit", submitBid);

// Get my bids
router.get("/my", getMyBids);

// Update an existing bid
router.put("/:bidId", updateBid);

// Withdraw / delete a bid
router.delete("/:bidId", deleteBid);

// Select contractor + deploy contract
router.post("/select", selectBid);

module.exports = router;