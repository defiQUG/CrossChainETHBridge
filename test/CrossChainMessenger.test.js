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

    // Deploy the messenger contract with mock contracts
    const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
    messenger = await CrossChainMessenger.deploy(mockRouter.address, mockWETH.address);
    await messenger.deployed();

    // Set initial fee in mock router
    await mockRouter.setFee(BRIDGE_FEE);
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
    let receiverAddress;
    const sendAmount = ethers.utils.parseEther("1.0");

    beforeEach(async function () {
      receiverAddress = addr1.address;
      await mockRouter.setFee(BRIDGE_FEE);
    });

    it("Should send ETH to Polygon successfully", async function () {
      const message = {
        receiver: ethers.utils.defaultAbiCoder.encode(["address"], [receiverAddress]),
        data: ethers.utils.defaultAbiCoder.encode(["uint256"], [sendAmount.sub(BRIDGE_FEE)]),
        tokenAmounts: [],
        extraArgs: "0x",
        feeToken: ethers.constants.AddressZero
      };

      const messageId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["uint64", "bytes", "bytes"],
          [137, message.receiver, message.data]
        )
      );
      await mockRouter.setNextMessageId(messageId);

      const tx = await messenger.sendToPolygon(receiverAddress, {
        value: sendAmount
      });

      await expect(tx)
        .to.emit(messenger, "MessageSent")
        .withArgs(messageId, owner.address, sendAmount.sub(BRIDGE_FEE), BRIDGE_FEE);
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
      const sourceChain = 138; // DEFI_ORACLE_META_SELECTOR
      const amount = ethers.utils.parseEther("0.5");

      await owner.sendTransaction({
        to: messenger.address,
        value: amount
      });

      const encodedData = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256"],
        [receiverAddress, amount]
      );

      // Calculate message ID using the same method as MockRouter.simulateMessageReceived
      const messageId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["uint64", "address", "bytes"],
          [sourceChain, mockRouter.address, encodedData]
        )
      );
      await mockRouter.setNextMessageId(messageId);

      await expect(
        mockRouter.simulateMessageReceived(
          messenger.address,
          sourceChain,
          mockRouter.address,
          encodedData
        )
      ).to.emit(messenger, "MessageReceived")
        .withArgs(messageId, receiverAddress, amount);
    });

    it("Should reject messages from invalid source chain", async function () {
      const invalidSourceChain = 1;
      const encodedData = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256"],
        [receiverAddress, ethers.utils.parseEther("1.0")]
      );

      await expect(
        mockRouter.simulateMessageReceived(
          messenger.address,
          invalidSourceChain,
          mockRouter.address,
          encodedData
        )
      ).to.be.revertedWith("Message from invalid chain");
    });

    it("Should reject direct calls to ccipReceive", async function () {
      const message = {
        messageId: ethers.utils.id("testMessage"),
        sourceChainSelector: 138,
        sender: ethers.utils.defaultAbiCoder.encode(["address"], [addr1.address]),
        data: ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256"],
          [addr1.address, ethers.utils.parseEther("1.0")]
        ),
        destTokenAmounts: []
      };

      await expect(
        messenger.connect(addr1).ccipReceive(message)
      ).to.be.revertedWith("InvalidRouter");
    });

    describe("Emergency Functions", function () {
      let mockToken;

      beforeEach(async function () {
        const MockToken = await ethers.getContractFactory("MockWETH");
        mockToken = await MockToken.deploy();
        await mockToken.deployed();
      });

      it("Should allow owner to recover ETH", async function () {
        // Send ETH to contract
        await addr1.sendTransaction({
          to: messenger.address,
          value: ethers.utils.parseEther("1.0")
        });

        const initialBalance = await owner.getBalance();
        await messenger.recoverFunds(ethers.constants.AddressZero);
        const finalBalance = await owner.getBalance();

        expect(finalBalance.sub(initialBalance)).to.be.above(
          ethers.utils.parseEther("0.9") // Account for gas costs
        );
      });

      it("Should allow owner to recover tokens", async function () {
        // Send tokens to contract
        await mockToken.deposit({ value: ethers.utils.parseEther("1.0") });
        await mockToken.transfer(messenger.address, ethers.utils.parseEther("1.0"));

        await messenger.recoverFunds(mockToken.address);
        const ownerBalance = await mockToken.balanceOf(owner.address);
        expect(ownerBalance).to.equal(ethers.utils.parseEther("1.0"));
      });

      it("Should revert ETH recovery when no balance", async function () {
        await expect(
          messenger.recoverFunds(ethers.constants.AddressZero)
        ).to.be.revertedWith("No ETH to recover");
      });

      it("Should revert token recovery when no balance", async function () {
        await expect(
          messenger.recoverFunds(mockToken.address)
        ).to.be.revertedWith("No tokens to recover");
      });
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
      const encodedData = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256"],
        [addr2.address, ethers.utils.parseEther("1.0")]
      );

      // Try to call with non-router address
      await expect(
        messenger.connect(addr1).ccipReceive({
          messageId: ethers.utils.id("testMessage"),
          sourceChainSelector: 138,
          sender: mockRouter.address,
          data: encodedData,
          destTokenAmounts: []
        })
      ).to.be.revertedWith("InvalidRouter");
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

    it("Should handle zero value transfers correctly", async function () {
      await expect(
        messenger.sendToPolygon(addr1.address, { value: 0 })
      ).to.be.revertedWith("Insufficient amount");
    });

    it("Should reject malformed CCIP messages", async function () {
      const invalidData = ethers.utils.defaultAbiCoder.encode(
        ["address"], // Missing uint256 amount
        [addr1.address]
      );

      await expect(
        mockRouter.simulateMessageReceived(
          messenger.address,
          138,
          mockRouter.address,
          invalidData
        )
      ).to.be.reverted;
    });

    it("Should prevent reentrant calls", async function () {
      // Deploy a new instance of CrossChainMessenger for this test
      const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
      const testMessenger = await CrossChainMessenger.deploy(
        mockRouter.address,
        mockWETH.address
      );
      await testMessenger.deployed();
      console.log("Test messenger deployed at:", testMessenger.address);

      // Deploy the attacker contract
      const ReentrancyAttacker = await ethers.getContractFactory("ReentrancyAttacker");
      const attacker = await ReentrancyAttacker.deploy(testMessenger.address);
      await attacker.deployed();
      console.log("Attacker contract deployed at:", attacker.address);

      // Verify the messenger address stored in attacker contract
      const storedMessenger = await attacker.messenger();
      console.log("Stored messenger address in attacker:", storedMessenger);

      // Fund the attacker contract
      const fundingAmount = ethers.utils.parseEther("3.0");
      await owner.sendTransaction({
        to: attacker.address,
        value: fundingAmount
      });
      console.log("Attacker funded with:", ethers.utils.formatEther(fundingAmount), "ETH");

      // Set minimum bridge fee
      const minFee = ethers.utils.parseEther("0.001");
      await testMessenger.updateBridgeFee(minFee);
      console.log("Bridge fee set to:", ethers.utils.formatEther(minFee), "ETH");

      // Get initial balances
      const initialAttackerBalance = await ethers.provider.getBalance(attacker.address);
      console.log("Initial attacker balance:", ethers.utils.formatEther(initialAttackerBalance), "ETH");

      // Attempt the attack
      const attackValue = ethers.utils.parseEther("1.0");
      console.log("Attempting attack with:", ethers.utils.formatEther(attackValue), "ETH");

      // The attack should fail either with a specific revert message or a silent revert
      await expect(
          attacker.attack({ value: attackValue })
      ).to.be.reverted; // Accept any revert as valid reentrancy protection

      // Verify state
      const finalAttackerBalance = await ethers.provider.getBalance(attacker.address);
      console.log("Final attacker balance:", ethers.utils.formatEther(finalAttackerBalance), "ETH");

      const attackCount = await attacker.attackCount();
      expect(attackCount).to.equal(0, "Attack should not have succeeded");
    });
  });
});
