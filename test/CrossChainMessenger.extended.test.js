const { ethers } = require("hardhat");

describe("CrossChainMessenger Extended Tests", function() {
  let messenger, router, weth, owner;
  const INITIAL_FEE = ethers.utils.parseEther("0.001");
  const NEW_FEE = ethers.utils.parseEther("0.002");

  beforeEach(async function() {
    [owner] = await ethers.getSigners();

    const MockRouter = await ethers.getContractFactory("MockRouter");
    router = await MockRouter.deploy();
    await router.deployed();

    const MockWETH = await ethers.getContractFactory("MockWETH");
    weth = await MockWETH.deploy("Wrapped Ether", "WETH");
    await weth.deployed();

    const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
    messenger = await CrossChainMessenger.deploy(
      router.address,
      weth.address,
      137 // Polygon PoS Chain ID
    );
    await messenger.deployed();
  });

  describe("Fee Management", function() {
    it("Should update bridge fee correctly", async function() {
      await messenger.setBridgeFee(NEW_FEE);
      expect(await messenger.bridgeFee()).to.equal(NEW_FEE);
    });
  });
});
