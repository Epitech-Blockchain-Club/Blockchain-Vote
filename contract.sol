pragma solidity 0.8.0;

contract Voting {
    struct Candidate {
        string name;
        uint voteCount;
    }

    address public owner;
    bool public electionActive;
    Candidate[] public candidates;
    mapping(address => bool) public hasVoted;
    uint public neutralVotes;

    modifier onlyOwner() {
        require(msg.sender == owner, "Seul le proprietaire peut effectuer cette action");
        _;
    }

    modifier electionOngoing() {
        require(electionActive, "L'election n'est pas active");
        _;
    }

    constructor() {
        owner = msg.sender;
        electionActive = false;
    }

    function startElection() public onlyOwner {
        electionActive = true;
    }

    function endElection() public onlyOwner {
        electionActive = false;
    }

    function addCandidate(string memory _name) public onlyOwner {
        candidates.push(Candidate(_name, 0));
    }

    function vote(uint candidateIndex) public electionOngoing {
        require(!hasVoted[msg.sender], "Vous avez deja vote");
        require(candidateIndex < candidates.length, "Candidat invalide");

        candidates[candidateIndex].voteCount++;
        hasVoted[msg.sender] = true;
    }

    function voteNeutral() public electionOngoing {
        require(!hasVoted[msg.sender], "Vous avez deja vote");

        neutralVotes++;
        hasVoted[msg.sender] = true;
    }

    function getCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }
}