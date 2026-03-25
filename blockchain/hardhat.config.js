import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config.js";

let accounts = [];
if (process.env.PRIVATE_KEY) {
  let pk = process.env.PRIVATE_KEY.toString().replace(/^["']|["']$/g, '').trim();
  if (pk !== "your_private_key_here" && pk !== "") {
    if (!pk.startsWith("0x")) {
      pk = "0x" + pk;
    }
    if (pk.length !== 66) {
      console.warn("\n⚠️ WARNING: Your PRIVATE_KEY in .env does not seem to be a 64-character hex string. Deployment may fail.\n");
    }
    accounts = [pk];
  }
}

export default {
  solidity: "0.8.24",
  networks: {
    shardeum: {
      url: "https://api-mezame.shardeum.org",
      chainId: 8119,
      accounts: accounts
    }
  }
};