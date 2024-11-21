const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrossChainMessenger", function () {
  let CrossChainMessenger;
  let messenger;
  let owner;
  let addr1;
  let addr2;

  // We define a fixture to reuse the same setup in every test
  beforeEach(async function () {
    // Get the ContractFactory and Signers here
    CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the contract with a mock router address for testing
    messenger = await CrossChainMessenger.deploy("0x0000000000000000000000000000000000000001");
    await messenger.deployed();
  });

  // Test case structure (actual tests will be implemented in the next step)
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await messenger.owner()).to.equal(owner.address);
    });
  });
});
