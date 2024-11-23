const { ethers } = require('hardhat'); const { expect } = require('chai'); const { deployTestContracts, TEST_CONFIG } = require('./helpers/setup'); const { deployContract, getContractAt } = require('./helpers/test-utils');

describe("RateLimiter", function() {
    let owner, user1, user2;
    let rateLimiter;
    const MAX_MESSAGES_PER_PERIOD = 5;
    const PERIOD_LENGTH = 3600; // 1 hour in seconds
    beforeEach(async function() {
    const contracts = await deployTestContracts();
    owner = contracts.owner;
    user = contracts.user;
    addr1 = contracts.addr1;
    addr2 = contracts.addr2;
    mockRouter = contracts.mockRouter;
    mockWETH = contracts.mockWETH;
    crossChainMessenger = contracts.crossChainMessenger;
        [owner, user1, user2] = await ethers.getSigners();
        const RateLimiter = await ethers.getContractFactory("RateLimiter");
        rateLimiter = await RateLimiter.deploy(MAX_MESSAGES_PER_PERIOD, PERIOD_LENGTH);
        await rateLimiter.waitForDeployment();
    });
    describe("Rate Limiting", function() {
        it("Should allow messages within rate limit", async function() {
            for (let i = 0; i < MAX_MESSAGES_PER_PERIOD; i++) {
                await rateLimiter.checkAndUpdateRateLimit();
            }
            await expect(rateLimiter.checkAndUpdateRateLimit())
                .to.be.revertedWith("Rate limit exceeded");
        });
        it("Should reset counter after period", async function() {
            // Use up all messages
            // Advance time by period length
            await time.increase(PERIOD_LENGTH);
            // Should be able to send messages again
            await expect(rateLimiter.checkAndUpdateRateLimit()).to.not.be.reverted;
        it("Should allow owner to update rate limit", async function() {
            const newLimit = 10;
            await rateLimiter.connect(owner).setMaxMessagesPerPeriod(newLimit);
            // Should allow more messages now
            for (let i = 0; i < newLimit; i++) {
        it("Should allow owner to update period length", async function() {
            const newPeriod = 7200; // 2 hours
            await rateLimiter.connect(owner).setPeriodLength(newPeriod);
            // Advance time by old period length
            // Should still be rate limited
            // Advance time to complete new period
            await time.increase(newPeriod - PERIOD_LENGTH);
            // Should work now
    describe("Access Control", function() {
        it("Should prevent non-owners from updating rate limit", async function() {
            await expect(
                rateLimiter.connect(user1).setMaxMessagesPerPeriod(10)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        it("Should prevent non-owners from updating period length", async function() {
                rateLimiter.connect(user1).setPeriodLength(7200)
        it("Should emit events on configuration changes", async function() {
            const newPeriod = 7200;
            await expect(rateLimiter.setMaxMessagesPerPeriod(newLimit))
                .to.emit(rateLimiter, "MaxMessagesPerPeriodUpdated")
                .withArgs(MAX_MESSAGES_PER_PERIOD, newLimit);
            await expect(rateLimiter.setPeriodLength(newPeriod))
                .to.emit(rateLimiter, "PeriodLengthUpdated")
                .withArgs(PERIOD_LENGTH, newPeriod);
});
