pragma solidity ^0.4.4;

/*Change name to ElectoralSystem to be clearer*/
contract Voting {

  struct Voter {
    bool voted;
    uint votedFor;
    bool registered;
  }

  struct Candidate {
    bytes32 name;
    uint voteCount;
  }

  struct Election {
    address administrator;
    string title;
    uint deadline;
    bool status;
    Candidate[] candidatesList;
  }

  event Voted(uint candidateID, address voter);
  event Registered(address voter);

  Election public currentElection;

  mapping(address => Voter) public voters;

  function Voting(string _title, uint _electionPeriod, bytes32[] candidateNames) {
    createCandidateList(candidateNames);

    currentElection.administrator = msg.sender;
    currentElection.title = _title;
    currentElection.deadline = now + _electionPeriod * 1 days;
    currentElection.status = true;
  }

  modifier registeredVoter() {
    if (!voters[msg.sender].registered) throw;
    _;
  }

  function createCandidateList(bytes32[] candidateNames) {
    for (uint i = 0; i < candidateNames.length; i++) {
      currentElection.candidatesList.push(Candidate({
        name: candidateNames[i],
        voteCount: 0
        }));
      }
    }

    function registerVoter(address account){
      Voter newVoter = voters[account];
      newVoter.registered = true;
      Registered(account);
    }

    function getCandidatesCount() constant returns (uint) {
      return currentElection.candidatesList.length;
    }

    function getCandidateVotes(uint candidateID) constant returns (uint totalVotes) {
      return currentElection.candidatesList[candidateID].voteCount;
    }

    function displayOwnVote() constant returns (string candidateName) {
      Voter currentVoter = voters[msg.sender];

       //if(currentVoter.voted != true) throw;
 			uint candidateID = currentVoter.votedFor;
 			bytes32 candidate32 = currentElection.candidatesList[candidateID].name;
 			return bytes32ToString(candidate32);
 		}

    function vote(uint candidateID) registeredVoter {

      Voter currentVoter = voters[msg.sender];
      if (currentVoter.voted) throw;
      if (now > currentElection.deadline) throw;

      currentVoter.voted = true;
      currentVoter.votedFor = candidateID;
      currentElection.candidatesList[candidateID].voteCount++;
      Voted(candidateID, msg.sender);
    }

    function tallyElectionResults() constant returns (uint winningCandidateID) {
      uint winningVoteCount = 0;
      for (uint candidateID = 0; candidateID < currentElection.candidatesList.length; candidateID++) {
        if (currentElection.candidatesList[candidateID].voteCount > winningVoteCount) {
          winningVoteCount = currentElection.candidatesList[candidateID].voteCount;
          winningCandidateID = candidateID;
        }
      }
    }

    function declareWinner() constant returns (string winnerName) {
      bytes32 winnerBytes = currentElection.candidatesList[tallyElectionResults()].name;
      winnerName = bytes32ToString(winnerBytes);
    }

    function bytes32ToString(bytes32 data) returns (string) {
      bytes memory bytesString = new bytes(32);
      for (uint j=0; j<32; j++) {
        byte char = byte(bytes32(uint(data) * 2 ** (8 * j)));
        if (char != 0) {
          bytesString[j] = char;
        }
      }
      return string(bytesString);
    }
}
