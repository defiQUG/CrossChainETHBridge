const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("EmergencyPause", function () {
  let emergencyPause;
  let owner;
  let pauser;
  let user;

  beforeEach(async function () {
    [owner, pauser, user] = await ethers.getSigners();
    const EmergencyPause = await ethers.getContractFactory("EmergencyPause");
    emergencyPause = await EmergencyPause.deploy();
    await emergencyPause.deployed();
  });

  describe("Access Control", function () {
    it("Should set owner as initial pauser", async function () {
      expect(await emergencyPause.pausers(owner.address)).to.be.true;
    });

    it("Should allow owner to add pauser", async function () {
      await emergencyPause.addPauser(pauser.address);
      expect(await emergencyPause.pausers(pauser.address)).to.be.true;
    });

    it("Should prevent non-owner from adding pauser", async function () {
      await expect(emergencyPause.connect(user).addPauser(pauser.address))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow owner to remove pauser", async function () {
      await emergencyPause.addPauser(pauser.address);
      await emergencyPause.removePauser(pauser.address);
      expect(await emergencyPause.pausers(pauser.address)).to.be.false;
    });
  });

  describe("Pause Functionality", function () {
    beforeEach(async function () {
      await emergencyPause.addPauser(pauser.address);
    });

    it("Should allow pauser to request pause", async function () {
      await expect(emergencyPause.connect(pauser).requestPause())
        .to.emit(emergencyPause, "PauseRequested")
        .withArgs(pauser.address, (await time.latest()) + 3600);
    });

    it("Should enforce pause delay", async function () {
      await emergencyPause.connect(pauser).requestPause();
      await expect(emergencyPause.connect(pauser).executePause())
        .to.be.revertedWithCustomError(emergencyPause, "PauseDelayNotMet");
    });

    it("Should allow pause execution after delay", async function () {
      await emergencyPause.connect(pauser).requestPause();
      await time.increase(3601);
      await emergencyPause.connect(pauser).executePause();
      expect(await emergencyPause.paused()).to.be.true;
    });

    it("Should allow owner to emergency pause without delay", async function () {
      await emergencyPause.emergencyPause();
      expect(await emergencyPause.paused()).to.be.true;
    });

    it("Should allow only owner to unpause", async function () {
      await emergencyPause.emergencyPause();
      await expect(emergencyPause.connect(pauser).unpause())
        .to.be.revertedWith("Ownable: caller is not the owner");
      await emergencyPause.unpause();
      expect(await emergencyPause.paused()).to.be.false;
    });
  });

  describe("Pause Request Management", function () {
    beforeEach(async function () {
      await emergencyPause.addPauser(pauser.address);
    });

    it("Should allow pauser to cancel their request", async function () {
      await emergencyPause.connect(pauser).requestPause();
      await emergencyPause.connect(pauser).cancelPause();
      await time.increase(3601);
      await expect(emergencyPause.connect(pauser).executePause())
        .to.be.revertedWithCustomError(emergencyPause, "NoPendingPause");
    });

    it("Should allow owner to cancel any pause request", async function () {
      await emergencyPause.connect(pauser).requestPause();
      await emergencyPause.cancelPause();
      await time.increase(3601);
      await expect(emergencyPause.connect(pauser).executePause())
        .to.be.revertedWithCustomError(emergencyPause, "NoPendingPause");
    });
  });
});
