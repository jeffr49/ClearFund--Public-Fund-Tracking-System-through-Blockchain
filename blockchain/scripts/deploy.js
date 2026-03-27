const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Factory = await ethers.getContractFactory("Factory");

  // ethers v6: waitForDeployment() instead of deployed()
  const factory = await Factory.deploy();
  await factory.waitForDeployment();

  // ethers v6: factory.target instead of factory.address
  console.log("✅ Factory deployed at:", factory.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});