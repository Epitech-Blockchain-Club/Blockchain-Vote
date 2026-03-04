// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VoteSession.sol";

/**
 * @title Scrutin
 * @dev Manages a single voting event (Scrutin) containing multiple sessions.
 */
contract Scrutin {
    enum Status { Pending, Active, Closed }

    string public title;
    string public description;
    string public scope;
    string public country;
    uint256 public startTime;
    uint256 public endTime;
    Status public status;
    address public owner;

    address[] public sessionAddresses;
    mapping(address => bool) public isSession;

    event SessionAdded(address sessionAddress, string title);
    event ScrutinStatusChanged(Status newStatus);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(
        string memory _title,
        string memory _description,
        string memory _scope,
        string memory _country,
        uint256 _startTime,
        uint256 _endTime,
        address _owner
    ) {
        title = _title;
        description = _description;
        scope = _scope;
        country = _country;
        startTime = _startTime;
        endTime = _endTime;
        owner = _owner;
        status = Status.Pending;
    }

    function addVoteSession(
        string memory _sessionTitle,
        string memory _sessionDescription,
        uint256 _voterCount,
        address[] memory _moderators
    ) external onlyOwner {
        VoteSession newSession = new VoteSession(
            _sessionTitle,
            _sessionDescription,
            _voterCount,
            _moderators,
            address(this)
        );
        address sessionAddr = address(newSession);
        sessionAddresses.push(sessionAddr);
        isSession[sessionAddr] = true;
        emit SessionAdded(sessionAddr, _sessionTitle);
    }

    function getSessions() external view returns (address[] memory) {
        return sessionAddresses;
    }

    function startScrutin() external onlyOwner {
        require(status == Status.Pending, "Already started or closed");
        status = Status.Active;
        emit ScrutinStatusChanged(status);
    }

    function closeScrutin() external onlyOwner {
        require(status == Status.Active, "Not active");
        status = Status.Closed;
        emit ScrutinStatusChanged(status);
    }
}
