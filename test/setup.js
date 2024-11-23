const chai = require("chai");
const { waffleChai } = require("@ethereum-waffle/chai");
const { solidity } = require("ethereum-waffle");

chai.use(waffleChai);
chai.use(solidity);

module.exports = {
  expect: chai.expect
};
