const { expect } = require('chai');
const { ethers } = require('hardhat');

describe("Custom Error Test", function () {
    let messenger, mockRouter;

    beforeEach(async function () {
        const MessengerFactory = await ethers.getContractFactory("CrossChainMessenger");
        const MockRouterFactory = await ethers.getContractFactory("MockRouter");

        mockRouter = await MockRouterFactory.deploy(100, 3600);
        await mockRouter.deployed();

        const EmergencyPauseFactory = await ethers.getContractFactory("EmergencyPause");
        const emergencyPause = await EmergencyPauseFactory.deploy();
        await emergencyPause.deployed();

        const WETHFactory = await ethers.getContractFactory("MockWETH");
        const weth = await WETHFactory.deploy();
        await weth.deployed();

        messenger = await MessengerFactory.deploy(
            mockRouter.address,
            weth.address,
            mockRouter.address,
            emergencyPause.address,
            ethers.utils.parseEther("0.01"),
            ethers.utils.parseEther("0.1")
        );
        await messenger.deployed();
    });

    it("Should revert with InvalidSourceChain error", async function () {
        const message = {
            messageId: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
            sourceChainSelector: 999n,
            sender: ethers.utils.hexZeroPad(ethers.constants.AddressZero, 32),
            data: "0x",
            destTokenAmounts: [],
            feeToken: ethers.constants.AddressZero,
            feeTokenAmount: BigInt(0),
            extraArgs: "0x"
        };

        await expect(
            messenger.ccipReceive(message)
        ).to.be.revertedWith("InvalidSourceChain");
    });
});
