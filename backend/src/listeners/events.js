const { ethers } = require("ethers");
const abi = require("../../abi/ProjectEscrow.json");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

exports.listenToProject = (address) => {
  const contract = new ethers.Contract(address, abi, provider);

  contract.on("ProofSubmitted", (id, hash) => {
    console.log("Proof submitted:", id, hash);
  });

  contract.on("FundsReleased", (id, amount) => {
    console.log("Funds released:", id);
  });
};