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
    const INITIAL_FEE = ethers.parseEther("0.001");
    const NEW_FEE = ethers.parseEther("0.002");

    beforeEach(async function() {
        const contracts = await deployTestContracts();
        ({ owner, user, addr1, addr2, mockRouter, mockWETH, crossChainMessenger } = contracts);

        const MockRouter = await ethers.getContractFactory("MockRouter");
        router = await MockRouter.deploy();

        const MockWETH = await ethers.getContractFactory("MockWETH");
        weth = await MockWETH.deploy("Wrapped Ether", "WETH");

        const CrossChainMessenger = await ethers.getContractFactory("CrossChainMessenger");
        messenger = await CrossChainMessenger.deploy(
            router.address,
            weth.address,
            ethers.parseEther("10"), // maxMessagesPerPeriod
            ethers.parseEther("100"), // pauseThreshold
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
