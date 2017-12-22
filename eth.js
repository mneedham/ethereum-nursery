const fs = require("fs"),
      abiDecoder = require('abi-decoder'),
      Web3 = require('web3'),
      contract = require("truffle-contract");

let provider = new Web3.providers.HttpProvider("http://localhost:7545");
web3 = new Web3(provider);

let votingContract = fs.readFileSync("build/contracts/Voting.json");
let votingArtifacts = JSON.parse(votingContract);

let Voting = contract(votingArtifacts)
Voting.setProvider(provider);

if (typeof Voting.currentProvider.sendAsync !== "function") {
  Voting.currentProvider.sendAsync = function () {
    return Voting.currentProvider.send.apply(Voting.currentProvider, arguments);
  };
}


let accountNumber = web3.eth.accounts[0];

Voting.deployed().then(function(contractInstance) {
  return contractInstance.vote(0, {from: accountNumber})
}).then(transaction => {
    console.log("Voted lodged. Transaction ID: " + transaction.tx);
}).catch(err => {
  console.log(err);
});

abiDecoder.addABI(votingArtifacts.abi);

web3.eth.getBlock(1, true).then(block => {
  block.transactions.forEach(transaction => {
    console.log(abiDecoder.decodeMethod(transaction.input));
  });
});
