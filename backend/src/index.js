const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/projects", require("./routes/projects"));
app.use("/bids", require("./routes/bids"));
app.use("/upload", require("./routes/upload"));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});