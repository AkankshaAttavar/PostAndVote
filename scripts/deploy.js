const fs = require('fs');
const { ethers, artifacts } = require('hardhat');

async function main() {
  // Fetch the signer accounts
  const [deployer, user1, user2] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the Decentratwitter contract
  const DecentratwitterFactory = await ethers.getContractFactory("Decentratwitter");
  const decentratwitter = await DecentratwitterFactory.deploy();
  await decentratwitter.deployed();

  console.log("Decentratwitter deployed to:", decentratwitter.address);

  // Directory to save contract data
  const contractsDir = __dirname + "/../src/contractsData";

  // Ensure the directory for contract data exists
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  // Save the contract address to a JSON file
  fs.writeFileSync(
    contractsDir + `/decentratwitter-address.json`,
    JSON.stringify({ address: decentratwitter.address }, undefined, 2)
  );

  // Save the contract's ABI (Application Binary Interface) to a JSON file
  const contractArtifact = artifacts.readArtifactSync("Decentratwitter");
  fs.writeFileSync(
    contractsDir + `/decentratwitter.json`,
    JSON.stringify(contractArtifact, null, 2)
  );

  console.log("Contract data saved successfully.");

  // Example of interaction: Set the first user's profile
  const tx = await decentratwitter.connect(user1).mint("ipfs://sample_uri");
  await tx.wait();

  console.log(`User1 (${user1.address}) minted their profile NFT`);

  // Additional setup or interactions could be added here
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error during deployment:", error);
    process.exit(1);
  });
