const router = require("express").Router();

const {
  submitBid,
  selectBid,
  getMyBids
} = require("../controllers/bidController");

// Submit bid
router.post("/submit", submitBid);

// Get my bids
router.get("/my", getMyBids);

// Select contractor + deploy contract
router.post("/select", selectBid);

module.exports = router;