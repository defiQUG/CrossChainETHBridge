const { expect } = require('chai');
const { ethers } = require('hardhat');
const { deployTestContracts } = require('./helpers/TestSetup');
const { createCCIPMessage } = require('./helpers/test-utils');

describe('SecurityBase', function() {
    let owner, user, rateLimiter, emergencyPause, mockMessage;

    beforeEach(async function() {
        const contracts = await deployTestContracts();
        owner = contracts.owner;
        user = contracts.user;
        rateLimiter = contracts.rateLimiter;
        emergencyPause = contracts.emergencyPause;

        // Create mock message for testing
        mockMessage = createCCIPMessage({
            sender: owner.address,
            data: ethers.hexlify(ethers.toUtf8Bytes("test message"))
        });
    });

    describe('Security Features', function() {
        it('Should prevent message replay attacks', async function() {
            await rateLimiter._processMessage(mockMessage.messageId, mockMessage.data);
            await expect(
                rateLimiter._processMessage(mockMessage.messageId, mockMessage.data)
            ).to.be.revertedWithCustomError(rateLimiter, 'MessageAlreadyProcessed')
             .withArgs(mockMessage.messageId);
        });

        it('Should reject empty message data', async function() {
            const emptyMessage = createCCIPMessage({
                sender: owner.address,
                data: '0x'
            });
            await expect(
                rateLimiter._processMessage(emptyMessage.messageId, emptyMessage.data)
            ).to.be.revertedWithCustomError(rateLimiter, 'InvalidMessageData');
        });

        it('Should increment message count on successful processing', async function() {
            const initialCount = await rateLimiter.messageCount();
            await rateLimiter._processMessage(mockMessage.messageId, mockMessage.data);
            expect(await rateLimiter.messageCount()).to.equal(initialCount + 1n);
        });

        it('Should emit MessageProcessed event', async function() {
            await expect(rateLimiter._processMessage(mockMessage.messageId, mockMessage.data))
                .to.emit(rateLimiter, 'MessageProcessed')
                .withArgs(owner.address, mockMessage.messageId, await ethers.provider.getBlock('latest').then(b => b.timestamp));
        });
    });

    describe('Emergency Controls', function() {
        it('Should pause message processing', async function() {
            await rateLimiter.emergencyPause();
            await expect(
                rateLimiter._processMessage(mockMessage.messageId, mockMessage.data)
            ).to.be.revertedWith('Pausable: paused');
        });

        it('Should emit SecurityPaused event', async function() {
            await expect(rateLimiter.emergencyPause())
                .to.emit(rateLimiter, 'SecurityPaused')
                .withArgs(owner.address, await ethers.provider.getBlock('latest').then(b => b.timestamp));
        });

        it('Should unpause message processing', async function() {
            await rateLimiter.emergencyPause();
            await rateLimiter.emergencyUnpause();
            await expect(rateLimiter._processMessage(mockMessage.messageId, mockMessage.data))
                .to.not.be.reverted;
        });

        it('Should emit SecurityUnpaused event', async function() {
            await rateLimiter.emergencyPause();
            await expect(rateLimiter.emergencyUnpause())
                .to.emit(rateLimiter, 'SecurityUnpaused')
                .withArgs(owner.address, await ethers.provider.getBlock('latest').then(b => b.timestamp));
        });
    });
});
