import type { AuditFinding } from "@/types/audit";

export function generateFixedCode(originalCode: string, finding: AuditFinding): string {
  const lines = originalCode.split("\n");
  const fixedLines = [...lines];

  // Get the vulnerable lines
  const vulnerableLineNumbers = finding.lines;
  if (vulnerableLineNumbers.length === 0) return originalCode;

  const primaryLine = vulnerableLineNumbers[0] - 1; // Convert to 0-indexed

  switch (finding.category) {
    case "reentrancy":
      // Fix reentrancy by moving state updates before external calls
      return fixReentrancy(fixedLines, primaryLine);

    case "tx-origin":
      // Replace tx.origin with msg.sender
      return fixTxOrigin(fixedLines, primaryLine);

    case "unsafe-external-call":
      // Add proper error handling
      return fixUnsafeExternalCall(fixedLines, primaryLine);

    case "access-control":
      // Add access control modifiers
      return fixAccessControl(fixedLines, primaryLine);

    case "integer-overflow":
      // Add SafeMath or upgrade to 0.8+
      return fixIntegerOverflow(fixedLines, primaryLine);

    case "unchecked-low-level-call":
      // Add require check for low-level calls
      return fixUncheckedLowLevelCall(fixedLines, primaryLine);

    default:
      return originalCode;
  }
}

function fixReentrancy(lines: string[], lineIndex: number): string {
  // Find the function containing the vulnerable line
  let functionStart = lineIndex;
  while (functionStart > 0 && !lines[functionStart].includes("function")) {
    functionStart--;
  }

  // Find state updates and external calls
  let externalCallLine = -1;
  let stateUpdateLine = -1;

  for (let i = functionStart; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes(".call") || line.includes(".transfer") || line.includes(".send")) {
      externalCallLine = i;
    }
    if (line.includes("=") && !line.includes("==") && !line.includes("!=")) {
      stateUpdateLine = i;
    }
    if (line.includes("}") && i > functionStart) break;
  }

  // Add comment explaining the fix
  const fixedLines = [...lines];
  if (externalCallLine > -1 && stateUpdateLine > -1 && stateUpdateLine > externalCallLine) {
    // Swap the lines
    const temp = fixedLines[stateUpdateLine];
    fixedLines[stateUpdateLine] = fixedLines[externalCallLine];
    fixedLines[externalCallLine] = temp;

    // Add comment
    fixedLines.splice(externalCallLine, 0, "        // ✅ FIX: State updated before external call to prevent reentrancy");
  }

  return fixedLines.join("\n");
}

function fixTxOrigin(lines: string[], lineIndex: number): string {
  const fixedLines = [...lines];
  const line = fixedLines[lineIndex];

  // Replace tx.origin with msg.sender
  fixedLines[lineIndex] = line.replace(/tx\.origin/g, "msg.sender");

  // Add comment
  fixedLines.splice(lineIndex, 0, "        // ✅ FIX: Using msg.sender instead of tx.origin for authentication");

  return fixedLines.join("\n");
}

function fixUnsafeExternalCall(lines: string[], lineIndex: number): string {
  const fixedLines = [...lines];
  const line = fixedLines[lineIndex];

  // Check if it's a low-level call without error handling
  if (line.includes(".call") && !line.includes("require")) {
    const indent = line.match(/^\s*/)?.[0] || "        ";
    
    // Add require check
    fixedLines[lineIndex] = line.replace(/;$/, "");
    fixedLines.splice(lineIndex + 1, 0, `${indent}require(success, "External call failed");`);
    fixedLines.splice(lineIndex, 0, `${indent}// ✅ FIX: Added error handling for external call`);
  }

  return fixedLines.join("\n");
}

function fixAccessControl(lines: string[], lineIndex: number): string {
  const fixedLines = [...lines];

  // Find the function declaration
  let functionLine = lineIndex;
  while (functionLine > 0 && !lines[functionLine].includes("function")) {
    functionLine--;
  }

  const functionDeclaration = fixedLines[functionLine];
  const indent = functionDeclaration.match(/^\s*/)?.[0] || "    ";

  // Add onlyOwner modifier if not present
  if (!functionDeclaration.includes("onlyOwner") && !functionDeclaration.includes("private")) {
    fixedLines[functionLine] = functionDeclaration.replace(/\{$/, "onlyOwner {");
    fixedLines.splice(functionLine, 0, `${indent}// ✅ FIX: Added access control modifier`);
  }

  return fixedLines.join("\n");
}

function fixIntegerOverflow(lines: string[], lineIndex: number): string {
  const fixedLines = [...lines];
  const line = fixedLines[lineIndex];

  // Add comment suggesting upgrade to 0.8+
  const indent = line.match(/^\s*/)?.[0] || "        ";
  fixedLines.splice(lineIndex, 0, `${indent}// ✅ FIX: Consider upgrading to Solidity 0.8+ for automatic overflow protection`);
  fixedLines.splice(lineIndex + 1, 0, `${indent}// Or use SafeMath library for arithmetic operations`);

  return fixedLines.join("\n");
}

function fixUncheckedLowLevelCall(lines: string[], lineIndex: number): string {
  const fixedLines = [...lines];
  const line = fixedLines[lineIndex];

  // Add require check for low-level call result
  if (line.includes(".call") || line.includes(".delegatecall") || line.includes(".staticcall")) {
    const indent = line.match(/^\s*/)?.[0] || "        ";
    
    // Check if there's already a success variable
    if (line.includes("(bool success") || line.includes("(bool ")) {
      // Add require after the call
      fixedLines.splice(lineIndex + 1, 0, `${indent}require(success, "Low-level call failed");`);
      fixedLines.splice(lineIndex, 0, `${indent}// ✅ FIX: Added require check for low-level call`);
    } else {
      // Wrap in success check
      fixedLines[lineIndex] = `${indent}(bool success, ) = ${line.trim()}`;
      fixedLines.splice(lineIndex + 1, 0, `${indent}require(success, "Low-level call failed");`);
      fixedLines.splice(lineIndex, 0, `${indent}// ✅ FIX: Added error handling for low-level call`);
    }
  }

  return fixedLines.join("\n");
}

export function generateFullFixedContract(originalCode: string, findings: AuditFinding[]): string {
  let fixedCode = originalCode;

  // Sort findings by line number (descending) to avoid line number shifts
  const sortedFindings = [...findings].sort((a, b) => {
    const aLine = a.lines[0] || 0;
    const bLine = b.lines[0] || 0;
    return bLine - aLine;
  });

  // Apply fixes one by one
  for (const finding of sortedFindings) {
    fixedCode = generateFixedCode(fixedCode, finding);
  }

  // Add header comment
  const header = `// ✅ SMART_AUDIT - AUTO-FIXED CONTRACT
// Original vulnerabilities: ${findings.length}
// Fixed by SMART_AUDIT AI
// Review all changes before deployment
// ═══════════════════════════════════════════════════════════════

`;

  return header + fixedCode;
}
