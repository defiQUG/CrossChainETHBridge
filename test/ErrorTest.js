const { expect } = require('chai');
const { ethers } = require('hardhat');
const { deployTestContracts } = require('./helpers/setup');

describe("Custom Error Test", function () {
    let messenger, mockRouter, owner;

    beforeEach(async function () {
        const contracts = await deployTestContracts();
        messenger = contracts.crossChainMessenger;
        mockRouter = contracts.mockRouter;
        owner = contracts.owner;

        const message = {
            messageId: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
            sourceChainSelector: 999n,
            sender: ethers.utils.hexZeroPad(owner.address, 32),
            data: ethers.utils.defaultAbiCoder.encode(
                ['address', 'uint256'],
                [owner.address, ethers.utils.parseEther("1.0")]
            ),
            destTokenAmounts: [],
            feeToken: ethers.constants.AddressZero,
            feeTokenAmount: BigInt(0),
            extraArgs: "0x"
        };
    });

    it("Should revert with InvalidSourceChain error", async function () {
        const message = {
            messageId: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
            sourceChainSelector: 999n,
            sender: ethers.utils.hexZeroPad(owner.address, 32),
            data: ethers.utils.defaultAbiCoder.encode(
                ['address', 'uint256'],
                [owner.address, ethers.utils.parseEther("1.0")]
            ),
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
