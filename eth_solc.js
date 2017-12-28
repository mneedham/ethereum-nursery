const fs = require("fs"),
      abiDecoder = require('abi-decoder'),
      Web3 = require('web3'),
      solc = require('solc');

const input = fs.readFileSync('contracts/Token.sol');
const output = solc.compile(input.toString(), 1);
const bytecode = output.contracts[':Token'].bytecode;
const abi = JSON.parse(output.contracts[':Token'].interface);

let provider = new Web3.providers.HttpProvider("http://localhost:8545");
const web3 = new Web3(provider);
let Voting = new web3.eth.Contract(abi);

abiDecoder.addABI(abi);

var allAccounts;
web3.eth.getAccounts().then(accounts => {
  allAccounts = accounts;
  Voting.deploy({data: bytecode}).send({
    from: accounts[0],
    gas: 1500000,
    gasPrice: '30000000000000'
  }).on('receipt', receipt => {
    Voting.options.address = receipt.contractAddress;
    Voting.methods.transfer(accounts[1], 10).send({from: accounts[0]}).then(transaction => {
      console.log("Transfer lodged. Transaction ID: " + transaction.transactionHash);
      let blockHash = transaction.blockHash
      return web3.eth.getBlock(blockHash, true);
    }).then(block => {
      block.transactions.forEach(transaction => {
        console.log(abiDecoder.decodeMethod(transaction.input));
      });

      allAccounts.forEach(account => {
          Voting.methods.balances(account).call({from: allAccounts[0]}).then(amount => {
            console.log(account + ": " + amount);
          });
      });
    });
  });
});
