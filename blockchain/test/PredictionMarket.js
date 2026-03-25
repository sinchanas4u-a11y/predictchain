import { expect } from "chai";
import hardhat from "hardhat";
const { ethers } = hardhat;

describe("PredictionMarket Contract", function () {
  let predictionMarket;
  let owner;
  let user1;
  let user2;
  let user3;

  async function getCurrentTime() {
    const block = await ethers.provider.getBlock("latest");
    return block.timestamp;
  }

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
    predictionMarket = await PredictionMarket.deploy();
  });

  describe("Event Creation", function () {
    it("Should create an event and store correct details", async function () {
      const endTime = (await getCurrentTime()) + 3600;
      await predictionMarket.createPrediction("Will it rain?", "Weather prediction", endTime);
      
      const event = await predictionMarket.events(0);
      expect(event.title).to.equal("Will it rain?");
      expect(event.description).to.equal("Weather prediction");
      expect(Number(event.endTime)).to.equal(endTime);
      expect(event.resolved).to.be.false;
    });

    it("Should increment eventId for multiple events", async function () {
      const endTime = (await getCurrentTime()) + 3600;
      await predictionMarket.createPrediction("Event 1", "D1", endTime);
      await predictionMarket.createPrediction("Event 2", "D2", endTime);
      
      expect(await predictionMarket.nextEventId()).to.equal(2);
    });
  });

  describe("Staking and Funds Locking", function () {
    it("Should allow multiple users to stake and lock funds in the contract", async function () {
      const endTime = (await getCurrentTime()) + 3600;
      await predictionMarket.createPrediction("Staking Test", "Desc", endTime);

      const amount1 = ethers.parseEther("1.0");
      const amount2 = ethers.parseEther("2.0");
      
      await predictionMarket.connect(user1).placePrediction(0, true, { value: amount1 });
      await predictionMarket.connect(user2).placePrediction(0, false, { value: amount2 });

      // Check contract balance
      const contractBalance = await ethers.provider.getBalance(await predictionMarket.getAddress());
      expect(contractBalance).to.equal(amount1 + amount2);

      // Check pools
      const ev = await predictionMarket.events(0);
      expect(ev.totalYesPool).to.equal(amount1);
      expect(ev.totalNoPool).to.equal(amount2);
    });

    it("Should correctly track individual user stakes", async function () {
      const endTime = (await getCurrentTime()) + 3600;
      await predictionMarket.createPrediction("User Stake Test", "Desc", endTime);

      const amount = ethers.parseEther("0.5");
      await predictionMarket.connect(user1).placePrediction(0, true, { value: amount });
      
      const stake = await predictionMarket.userStakes(0, user1.address);
      expect(stake.yesStake).to.equal(amount);
      expect(stake.noStake).to.equal(0);
    });

    it("Should revert if staking after endTime", async function () {
      const currentTime = await getCurrentTime();
      const shortEndTime = currentTime + 2;
      await predictionMarket.createPrediction("Expiring", "D", shortEndTime);
      
      await ethers.provider.send("evm_increaseTime", [5]);
      await ethers.provider.send("evm_mine");

      await expect(
        predictionMarket.connect(user1).placePrediction(0, true, { value: ethers.parseEther("1") })
      ).to.be.revertedWith("Event has ended");
    });
  });

  describe("Resolution and Rewards", function () {
    let endTime;

    beforeEach(async function () {
      endTime = (await getCurrentTime()) + 3600;
      await predictionMarket.createPrediction("Reward Test", "Desc", endTime);
      
      // User1: 2 ETH on YES
      await predictionMarket.connect(user1).placePrediction(0, true, { value: ethers.parseEther("2") });
      // User2: 8 ETH on NO
      await predictionMarket.connect(user2).placePrediction(0, false, { value: ethers.parseEther("8") });
      
      // Fast forward time to past endTime
      await ethers.provider.send("evm_increaseTime", [4000]);
      await ethers.provider.send("evm_mine");
    });

    it("Should only allow the creator to resolve", async function () {
      await expect(
        predictionMarket.connect(user1).resolvePrediction(0, true)
      ).to.be.revertedWith("Only owner can call this");
    });

    it("Should distribute rewards proportionally (Case: YES wins)", async function () {
      // YES wins. Total pool = 10 ETH. 
      // User1 is the only YES bettor, gets 100% of the pool (10 ETH)
      await predictionMarket.resolvePrediction(0, true);

      const initialBalance = await ethers.provider.getBalance(user1.address);
      const tx = await predictionMarket.connect(user1).claimReward(0);
      const receipt = await tx.wait();
      const gasSpent = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(user1.address);
      expect(finalBalance).to.equal(initialBalance + ethers.parseEther("10") - gasSpent);
    });

    it("Should distribute rewards proportionally (Case: NO wins)", async function () {
      // NO wins. Total pool = 10 ETH.
      // User2 is the only NO bettor, gets 100% of the pool (10 ETH)
      await predictionMarket.resolvePrediction(0, false);

      const initialBalance = await ethers.provider.getBalance(user2.address);
      const tx = await predictionMarket.connect(user2).claimReward(0);
      const receipt = await tx.wait();
      const gasSpent = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(user2.address);
      expect(finalBalance).to.equal(initialBalance + ethers.parseEther("10") - gasSpent);
    });

    it("Should prevent double claiming", async function () {
      await predictionMarket.resolvePrediction(0, true);
      await predictionMarket.connect(user1).claimReward(0);
      
      await expect(
        predictionMarket.connect(user1).claimReward(0)
      ).to.be.revertedWith("Reward already claimed");
    });

    it("Should revert if claiming from a losing bet", async function () {
      await predictionMarket.resolvePrediction(0, true); // YES won
      
      await expect(
        predictionMarket.connect(user2).claimReward(0) // User2 bet NO
      ).to.be.revertedWith("No winning stake");
    });
  });
});
