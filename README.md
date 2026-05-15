# SMART_AUDIT

**AI-Powered Smart Contract Auditor — Built for the CreateOS Ecosystem**

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![CreateOS](https://img.shields.io/badge/CreateOS-Compatible-green)](#)
[![MCP](https://img.shields.io/badge/MCP-Ready-purple)](#)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

> Assignment submission for the **NodeOps / CreateOS Forward Deployed Engineer** role.

---

## What is SMART_AUDIT?

SMART_AUDIT is a production-ready, AI-native smart contract security auditor. It detects vulnerabilities in Solidity code, scores contract security, and **automatically generates fixed code** — all in under 2 seconds, with no API keys required.

Built to demonstrate:
- Infrastructure-grade Next.js development
- MCP-ready API architecture
- CreateOS Skill compatibility
- AI-agent friendly JSON responses

---

## Live Demo

> **[smart-audit.vercel.app](https://smart-audit.vercel.app)** ← deployed link here

---

## Features

| Feature | Description |
|---------|-------------|
| **Vulnerability Detection** | 6 vulnerability types: reentrancy, tx.origin, access control, integer overflow, unsafe calls, unchecked low-level calls |
| **Security Scoring** | 0–100 score with letter grade (A–F) |
| **Auto-Fix Generation** | Automatically generates patched Solidity code with inline comments |
| **Side-by-Side Diff** | Original vs fixed code comparison modal |
| **Audit History** | LocalStorage-persisted audit log with stats dashboard |
| **PDF Export** | Download full audit report as PDF |
| **Share Report** | Shareable URL with encoded report |
| **MCP-Ready API** | `POST /api/audit` — structured JSON, AI-agent compatible |

---

## Pages

```
/           → Editor — paste contract, run audit, view findings, get auto-fix
/api-docs   → API Reference — endpoint docs, cURL examples, response schema
/docs       → Documentation — quickstart, detection engine, integrations
/history    → Audit History — past audits, stats, export
```

---

## Quick Start

No API keys needed. Everything works out of the box.

```bash
git clone https://github.com/0xMayurrr/AI-ContractAuditor.git
cd AI-ContractAuditor
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## API

### `POST /api/audit`

**Request**
```json
{
  "code": "pragma solidity ^0.8.0;\n\ncontract Example { ... }"
}
```

**Response**
```json
{
  "id": "uuid",
  "contractName": "Example",
  "securityScore": 72,
  "grade": "B",
  "findings": [
    {
      "id": "uuid",
      "severity": "high",
      "category": "reentrancy",
      "title": "Potential reentrancy via external call",
      "explanation": "...",
      "recommendation": "Update state before external call",
      "lines": [18]
    }
  ],
  "aiEnhanced": false,
  "lineCount": 50,
  "analyzedAt": "2024-01-01T00:00:00.000Z"
}
```

**Compatible with:**
- MCP (Model Context Protocol) tooling
- AI agent pipelines
- CreateOS Skills
- Any REST client

---

## Environment Variables

All optional. The app is fully functional without them.

```bash
# .env.local

# Enables AI-enhanced finding explanations via OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Enables fetching contracts by address from Etherscan
NEXT_PUBLIC_ETHERSCAN_API_KEY=...
```

---

## Deployment

### Vercel
```bash
npm run build
vercel --prod
```

### CreateOS
1. Push to GitHub
2. Connect repo in CreateOS dashboard
3. Deploy — no environment variables required for core functionality

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3
- **Icons:** Lucide React
- **Analysis:** Custom static analysis engine (`src/lib/analyzer/`)
- **Auto-Fix:** Pattern-based code transformer (`src/lib/autofix.ts`)
- **AI:** Optional OpenAI enrichment (`src/lib/ai.ts`)

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Editor page
│   ├── api-docs/page.tsx         # API documentation
│   ├── docs/page.tsx             # User documentation
│   ├── history/page.tsx          # Audit history
│   └── api/audit/route.ts        # POST /api/audit
├── components/
│   ├── AuditorDashboard.tsx      # Main editor UI
│   ├── FixedCodeViewer.tsx       # Auto-fix modal
│   ├── FindingCard.tsx           # Vulnerability card
│   ├── SecurityScore.tsx         # Score gauge
│   ├── CodeEditor.tsx            # Solidity editor
│   ├── ShareReport.tsx           # Share via URL
│   └── PdfExport.tsx             # PDF download
├── lib/
│   ├── analyzer/                 # Static analysis engine
│   │   ├── index.ts
│   │   ├── patterns.ts           # Vulnerability patterns
│   │   └── score.ts              # Scoring logic
│   ├── autofix.ts                # Auto-fix code generator
│   ├── ai.ts                     # OpenAI integration
│   └── sample-contract.ts        # Demo contract
└── types/
    └── audit.ts                  # TypeScript types
```

---

## CreateOS / MCP Alignment

This project is designed as a **CreateOS Skill** and **MCP-ready tool**:

- `POST /api/audit` is a clean, stateless endpoint any AI agent can call
- Structured JSON responses are agent-parseable
- No session state — fully serverless compatible
- Self-contained with no mandatory external services
- Can be registered as an MCP tool with the audit endpoint as the tool function

---

## Author

**Karthick Mayur**
Built for the NodeOps / CreateOS Forward Deployed Engineer challenge.

- GitHub: [@0xMayurrr](https://github.com/0xMayurrr)

---

## License

MIT
