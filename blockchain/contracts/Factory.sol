// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ProjectEscrow.sol";

contract Factory {

    address[] public projects;

    event ProjectCreated(address projectAddress, address contractor);

    function createProject(
        address contractor,
        address[] memory approvers,
        uint256[] memory amounts,
        uint256[] memory deadlines,
        uint8 threshold
    ) public payable {

        ProjectEscrow project = new ProjectEscrow{value: msg.value}(
            msg.sender,
            contractor,
            approvers,
            amounts,
            deadlines,
            threshold
        );

        projects.push(address(project));

        emit ProjectCreated(address(project), contractor);
    }

    function getProjects() public view returns (address[] memory) {
        return projects;
    }
}