const router = require("express").Router();

const {
  submitBid,
  selectBid
} = require("../controllers/bidController");

// Submit bid
router.post("/submit", submitBid);

// Select contractor + deploy contract
router.post("/select", selectBid);

module.exports = router;