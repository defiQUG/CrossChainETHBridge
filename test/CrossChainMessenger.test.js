const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrossChainMessenger", function () {
  let CrossChainMessenger;
  let messenger;
  let owner;
  let addr1;
  let addr2;
  let mockRouter;
  let mockWETH;
  const BRIDGE_FEE = ethers.utils.parseEther("0.001"); // 0.1%
  const MAX_FEE = ethers.utils.parseEther("0.01"); // 1%

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy mock router contract for testing
    const MockRouter = await ethers.getContractFactory("MockRouter");
    mockRouter = await MockRouter.deploy();
    await mockRouter.deployed();

    // Deploy mock WETH contract
    const MockWETH = await ethers.getContractFactory("MockWETH");
    mockWETH = await MockWETH.deploy();
    await mockWETH.deployed();

    // Override POLYGON_WETH address in messenger contract
    const overrideAddress = mockWETH.address;
    const messengerFactory = await ethers.getContractFactory("CrossChainMessenger");
    const messengerArtifact = await hre.artifacts.readArtifact("CrossChainMessenger");
    const modifiedBytecode = messengerArtifact.bytecode.replace(
        /0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/i,
        overrideAddress.slice(2).padStart(40, '0')
    );

    // Deploy the messenger contract with modified bytecode
    messenger = await ethers.getContractFactory(
        messengerArtifact.abi,
        modifiedBytecode
    ).then(factory => factory.deploy(mockRouter.address));

    await messenger.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await messenger.owner()).to.equal(owner.address);
    });

    it("Should have correct chain selectors", async function () {
      expect(await messenger.DEFI_ORACLE_META_SELECTOR()).to.equal(138);
      expect(await messenger.POLYGON_SELECTOR()).to.equal(137);
    });
  });

  describe("ETH Bridging", function () {
    const receiverAddress = addr1.address;
    const sendAmount = ethers.utils.parseEther("1.0");

    beforeEach(async function () {
      await mockRouter.setFee(BRIDGE_FEE);
    });

    it("Should send ETH to Polygon successfully", async function () {
      const tx = await messenger.sendToPolygon(receiverAddress, {
        value: sendAmount
      });

      await expect(tx)
        .to.emit(messenger, "MessageSent")
        .withArgs(
          ethers.constants.HashZero,
          owner.address,
          sendAmount.sub(BRIDGE_FEE),
          BRIDGE_FEE
        );
    });

    it("Should fail when sending with insufficient amount", async function () {
      const insufficientAmount = BRIDGE_FEE.div(2);
      await expect(
        messenger.sendToPolygon(receiverAddress, {
          value: insufficientAmount
        })
      ).to.be.revertedWith("Insufficient amount");
    });

    it("Should handle CCIP message receipt correctly", async function () {
      const messageId = ethers.utils.id("testMessage");
      const sourceChain = 138; // DEFI_ORACLE_META_SELECTOR
      const amount = ethers.utils.parseEther("0.5");

      // Fund the messenger contract with ETH for WETH minting
      await owner.sendTransaction({
        to: messenger.address,
        value: amount
      });

      const message = {
        messageId,
        sourceChainSelector: sourceChain,
        sender: mockRouter.address,
        data: ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256"],
          [receiverAddress, amount]
        ),
        destTokenAmounts: []
      };

      await expect(messenger.connect(mockRouter)._ccipReceive(message))
        .to.emit(messenger, "MessageReceived")
        .withArgs(messageId, receiverAddress, amount);
    });

    it("Should reject messages from invalid source chain", async function () {
      const messageId = ethers.utils.id("testMessage");
      const invalidSourceChain = 1; // Invalid chain selector

      const message = {
        messageId,
        sourceChainSelector: invalidSourceChain,
        sender: mockRouter.address,
        data: ethers.utils.defaultAbiCoder.encode(["address"], [receiverAddress]),
        destTokenAmounts: []
      };

      await expect(
        messenger.connect(mockRouter)._ccipReceive(message)
      ).to.be.revertedWith("Message from invalid chain");
    });
  });

  describe("Fee Management", function () {
    it("Should have correct initial fee", async function () {
      expect(await messenger.bridgeFee()).to.equal(BRIDGE_FEE);
    });

    it("Should allow owner to update fee", async function () {
      const newFee = ethers.utils.parseEther("0.002");
      await expect(messenger.updateBridgeFee(newFee))
        .to.emit(messenger, "BridgeFeeUpdated")
        .withArgs(newFee);
      expect(await messenger.bridgeFee()).to.equal(newFee);
    });

    it("Should prevent non-owner from updating fee", async function () {
      const newFee = ethers.utils.parseEther("0.002");
      await expect(
        messenger.connect(addr1).updateBridgeFee(newFee)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should prevent setting fee above maximum", async function () {
      const tooHighFee = MAX_FEE.add(1);
      await expect(
        messenger.updateBridgeFee(tooHighFee)
      ).to.be.revertedWith("Fee exceeds maximum");
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to pause", async function () {
      await messenger.pause();
      expect(await messenger.paused()).to.be.true;
    });

    it("Should allow owner to unpause", async function () {
      await messenger.pause();
      await messenger.unpause();
      expect(await messenger.paused()).to.be.false;
    });

    it("Should prevent non-owner from pausing", async function () {
      await expect(
        messenger.connect(addr1).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should prevent bridging when paused", async function () {
      await messenger.pause();
      await expect(
        messenger.sendToPolygon(addr1.address, { value: ethers.utils.parseEther("1.0") })
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should allow owner to recover ETH", async function () {
      const amount = ethers.utils.parseEther("1.0");
      await owner.sendTransaction({
        to: messenger.address,
        value: amount
      });

      const initialBalance = await owner.getBalance();
      await expect(messenger.recoverFunds(ethers.constants.AddressZero))
        .to.emit(messenger, "FundsRecovered")
        .withArgs(ethers.constants.AddressZero, amount);

      const finalBalance = await owner.getBalance();
      expect(finalBalance.sub(initialBalance)).to.be.closeTo(
        amount,
        ethers.utils.parseEther("0.001") // Account for gas
      );
    });
  });

  describe("Security", function () {
    it("Should only allow router to call _ccipReceive", async function () {
      const message = {
        messageId: ethers.utils.id("testMessage"),
        sourceChainSelector: 138,
        sender: addr1.address,
        data: ethers.utils.defaultAbiCoder.encode(["address"], [addr2.address]),
        destTokenAmounts: []
      };

      await expect(
        messenger.connect(addr1)._ccipReceive(message)
      ).to.be.revertedWith("Caller is not the router");
    });

    it("Should allow contract to receive ETH", async function () {
      const amount = ethers.utils.parseEther("1.0");
      await owner.sendTransaction({
        to: messenger.address,
        value: amount
      });

      const balance = await ethers.provider.getBalance(messenger.address);
      expect(balance).to.equal(amount);
    });
  });
});
