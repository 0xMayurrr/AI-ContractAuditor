export const SAMPLE_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

contract VulnerableVault {
    mapping(address => uint256) public balances;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    // CRITICAL: reentrancy — external call before state update
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount);
        (bool sent, ) = msg.sender.call{value: amount}("");
        balances[msg.sender] -= amount;
    }

    // HIGH: tx.origin authentication
    function emergencyWithdraw() external {
        require(tx.origin == owner);
        payable(owner).transfer(address(this).balance);
    }

    // HIGH: no access control on sensitive function
    function setOwner(address newOwner) external {
        owner = newOwner;
    }
}
`;
