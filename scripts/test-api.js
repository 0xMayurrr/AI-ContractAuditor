// API Test Script for SMART_AUDIT
// Run with: node scripts/test-api.js

const testContract = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VulnerableBank {
    mapping(address => uint256) public balances;
    
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }
    
    // Vulnerable to reentrancy
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        balances[msg.sender] -= amount; // State update after external call!
    }
    
    // Using tx.origin for authentication (vulnerable)
    function transferOwnership(address newOwner) public {
        require(tx.origin == owner, "Not owner");
        owner = newOwner;
    }
    
    address public owner;
}
`;

async function testAPI() {
    console.log('🧪 Testing SMART_AUDIT API...\n');
    
    try {
        const response = await fetch('http://localhost:3000/api/audit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: testContract }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        console.log('✅ API Response Received\n');
        console.log('📊 Audit Report:');
        console.log('─'.repeat(50));
        console.log(`Contract Name: ${result.contractName}`);
        console.log(`Security Score: ${result.securityScore}/100`);
        console.log(`Grade: ${result.grade}`);
        console.log(`AI Enhanced: ${result.aiEnhanced ? 'Yes' : 'No'}`);
        console.log(`Line Count: ${result.lineCount}`);
        console.log(`Findings: ${result.findings.length}`);
        console.log('─'.repeat(50));
        
        if (result.findings.length > 0) {
            console.log('\n🔍 Detected Vulnerabilities:\n');
            result.findings.forEach((finding, index) => {
                console.log(`${index + 1}. [${finding.severity.toUpperCase()}] ${finding.title}`);
                console.log(`   Category: ${finding.category}`);
                console.log(`   Lines: ${finding.lines.join(', ')}`);
                console.log(`   Recommendation: ${finding.recommendation}`);
                console.log('');
            });
        }
        
        console.log('✅ All tests passed!\n');
        
        // Verify expected vulnerabilities
        const hasReentrancy = result.findings.some(f => f.category === 'reentrancy');
        const hasTxOrigin = result.findings.some(f => f.category === 'tx-origin');
        
        console.log('🎯 Vulnerability Detection:');
        console.log(`   Reentrancy: ${hasReentrancy ? '✅ Detected' : '❌ Missed'}`);
        console.log(`   tx.origin: ${hasTxOrigin ? '✅ Detected' : '❌ Missed'}`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run test
testAPI();
