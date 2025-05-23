const { ethers } = require('hardhat');
const { expect } = require('chai');
const { deployTestContracts, TEST_CONFIG } = require('./helpers/setup');
const { deployContract, getContractAt } = require('./helpers/test-utils');

const {
    BRIDGE_FEE,
    MAX_FEE,
    MAX_MESSAGES_PER_PERIOD,
    PAUSE_THRESHOLD,
    PAUSE_DURATION,
    POLYGON_CHAIN_SELECTOR,
    DEFI_ORACLE_META_CHAIN_SELECTOR
} = TEST_CONFIG;

describe("CrossChainMessenger Extended Tests", function() {
    let messenger, router, weth, owner, user, addr1, addr2, mockRouter, mockWETH, crossChainMessenger;
    const INITIAL_FEE = ethers.utils.parseEther("0.001");
    const NEW_FEE = ethers.utils.parseEther("0.002");

    beforeEach(async function() {
        const contracts = await deployTestContracts();
        ({ owner, user, addr1, addr2, mockRouter, mockWETH, crossChainMessenger } = contracts);

        const MAX_MESSAGES = 10;
        const RATE_PERIOD = 3600; // 1 hour in seconds

        const MockRouter = await ethers.getContractFactory("MockRouter");
        router = await MockRouter.deploy(MAX_MESSAGES, RATE_PERIOD);

        const MockWETH = await ethers.getContractFactory("MockWETH");
        weth = await MockWETH.deploy("Wrapped Ether", "WETH");

        const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
        messenger = await CrossChainMessenger.deploy(
            router.address,
            weth.address,
            ethers.utils.parseEther("10"), // maxMessagesPerPeriod
            ethers.utils.parseEther("100"), // pauseThreshold
            86400 // pauseDuration (24 hours)
        );
    });

    describe("Fee Management", function() {
        it("Should update bridge fee correctly", async function() {
            await messenger.setBridgeFee(NEW_FEE);
            expect(await messenger.bridgeFee()).to.equal(NEW_FEE);
        });
    });
});
