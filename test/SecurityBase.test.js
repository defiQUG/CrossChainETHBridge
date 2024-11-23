const { expect } = require('chai');
const { ethers } = require('hardhat');
const { deployTestContracts } = require('./helpers/TestSetup');

describe('SecurityBase', function() {
  let owner, user, rateLimiter, emergencyPause;

  beforeEach(async function() {
    const contracts = await deployTestContracts();
    owner = contracts.owner;
    user = contracts.user;
    rateLimiter = contracts.rateLimiter;
    emergencyPause = contracts.emergencyPause;
  });

  describe('Ownership', function() {
    it('Should set correct owner on deployment', async function() {
      expect(await rateLimiter.owner()).to.equal(owner.address);
    });

    it('Should allow ownership transfer', async function() {
      await rateLimiter.transferOwnership(user.address);
      expect(await rateLimiter.owner()).to.equal(user.address);
    });

    it('Should prevent non-owners from transferring ownership', async function() {
      await expect(
        rateLimiter.connect(user).transferOwnership(user.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('Access Control', function() {
    it('Should restrict admin functions to owner', async function() {
      await expect(
        rateLimiter.connect(user).initialize(20, 7200)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });
});
