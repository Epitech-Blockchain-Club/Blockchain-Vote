// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VoteSession
 * @dev Manages a single vote session with multiple options (parts).
 */
contract VoteSession {
    struct Option {
        string title;
        uint256 voteCount;
    }

    string public title;
    string public description;
    uint256 public voterCount;
    address public scrutinAddress;
    address[] public moderators;
    
    Option[] public options;
    mapping(address => bool) public isModerator;
    mapping(bytes32 => bool) public hasVoted; // Hashed email or voter id
    
    bool public isValidated;
    bool public isInvalidated;
    string public invalidationReason;

    event VoteCast(bytes32 indexed voterHash, uint256 optionIndex);
    event SessionValidated(address moderator);
    event SessionInvalidated(address moderator, string reason);
    event OptionAdded(uint256 index, string title);

    modifier onlyModerator() {
        require(isModerator[msg.sender], "Not moderator");
        _;
    }

    constructor(
        string memory _title,
        string memory _description,
        uint256 _voterCount,
        address[] memory _moderators,
        address _scrutinAddress
    ) {
        title = _title;
        description = _description;
        voterCount = _voterCount;
        scrutinAddress = _scrutinAddress;
        moderators = _moderators;
        for (uint256 i = 0; i < _moderators.length; i++) {
            isModerator[_moderators[i]] = true;
        }
    }

    function addOption(string memory _optionTitle) external {
        // In a real scenario, this might need an owner check
        options.push(Option(_optionTitle, 0));
        emit OptionAdded(options.length - 1, _optionTitle);
    }

    function castVote(bytes32 _voterHash, uint256 _optionIndex) external {
        require(!hasVoted[_voterHash], "Already voted");
        require(_optionIndex < options.length, "Invalid option");
        
        options[_optionIndex].voteCount++;
        hasVoted[_voterHash] = true;
        emit VoteCast(_voterHash, _optionIndex);
    }

    function validate() external onlyModerator {
        isValidated = true;
        isInvalidated = false;
        emit SessionValidated(msg.sender);
    }

    function invalidate(string memory _reason) external onlyModerator {
        isInvalidated = true;
        isValidated = false;
        invalidationReason = _reason;
        emit SessionInvalidated(msg.sender, _reason);
    }

    function getOptions() external view returns (Option[] memory) {
        return options;
    }

    function getOptionCount() external view returns (uint256) {
        return options.length;
    }
}
