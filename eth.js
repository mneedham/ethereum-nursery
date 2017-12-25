const fs = require("fs"),
      abiDecoder = require('abi-decoder'),
      Web3 = require('web3'),
      contract = require("truffle-contract");

let provider = new Web3.providers.HttpProvider("http://localhost:8545");
web3 = new Web3(provider);

let votingContract = fs.readFileSync("build/contracts/Voting.json");
let votingArtifacts = JSON.parse(votingContract);
abiDecoder.addABI(votingArtifacts.abi);

let Voting = contract(votingArtifacts)
Voting.setProvider(web3.currentProvider);

if (typeof Voting.currentProvider.sendAsync !== "function") {
  Voting.currentProvider.sendAsync = function () {
    return Voting.currentProvider.send.apply(Voting.currentProvider, arguments);
  };
}

web3.eth.getAccounts().then(accounts => {
  return Promise.resolve(accounts[0]);
}).then(accountNumber => {
  console.log(accountNumber);
  return Voting.deployed().then(contractInstance => {
      console.log("about to vote");
      return contractInstance.vote(0, {from: accountNumber, gas: 1000000});
  })
}).then(transaction => {
  console.log("Voted lodged. Transaction ID: " + transaction.tx);
  let blockHash = transaction.receipt.blockHash
  return web3.eth.getBlock(blockHash, true);
}).then(block => {
  block.transactions.forEach(transaction => {
    console.log(abiDecoder.decodeMethod(transaction.input));
  })
}).catch(console.log);
