// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Scrutin.sol";

/**
 * @title ScrutinFactory
 * @dev Factory contract to deploy new Scrutin contracts.
 */
contract ScrutinFactory {
    address[] public deployedScrutins;
    address public owner;

    event ScrutinCreated(address scrutinAddress, string title, address owner);

    constructor() {
        owner = msg.sender;
    }

    function createScrutin(
        string memory _title,
        string memory _description,
        string memory _scope,
        string memory _country,
        uint256 _startTime,
        uint256 _endTime
    ) external returns (address) {
        Scrutin newScrutin = new Scrutin(
            _title,
            _description,
            _scope,
            _country,
            _startTime,
            _endTime,
            msg.sender
        );
        address scrutinAddr = address(newScrutin);
        deployedScrutins.push(scrutinAddr);
        emit ScrutinCreated(scrutinAddr, _title, msg.sender);
        return scrutinAddr;
    }

    function getDeployedScrutins() external view returns (address[] memory) {
        return deployedScrutins;
    }
}
