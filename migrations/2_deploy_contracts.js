var Voting = artifacts.require("./Voting.sol");

module.exports = function(deployer) {
  deployer.deploy(Voting, "Why", 3, ['Yes', 'No']);
};
