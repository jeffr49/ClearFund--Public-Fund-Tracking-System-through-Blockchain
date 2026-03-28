// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ProjectEscrow.sol";

/**
 * @notice Deploys `ProjectEscrow` instances. Milestone `amounts` are **whole INR** from the bid;
 *         no ETH is sent with deployment.
 */
contract Factory {

    address[] public projects;

    event ProjectCreated(address projectAddress, address contractor);

    function createProject(
        address contractor,
        address[] memory approvers,
        uint256[] memory amounts,
        uint256[] memory deadlines,
        uint8 threshold
    ) public {

        ProjectEscrow project = new ProjectEscrow(
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
