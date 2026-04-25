# Solace — Solana Agentic Treasury Manager

> AI-powered contributor payments for distributed teams on Solana

---

## Problem

Small teams and open-source organizations struggle to manage contributor payments — whether recurring salaries, merit-based rewards, or one-time tips. Admins manually check GitHub activity, calculate SOL amounts, look up wallet addresses, and send payments one by one. This process is slow, error-prone, and creates trust issues across distributed global teams.

---

## Solution

Solace lets admins issue natural language commands like:

```
"Pay top PR contributor this week $50"
"Send all active members their monthly salary"
"Tip John $10 for the hotfix"
```

The AI agent processes the command end-to-end and presents the transaction for human review. **Nothing hits the chain without explicit admin approval.**

---

## How It Works

```
Admin types natural language command
        ↓
AI Agent (Claude API tool-use)
        ↓
┌─────────────────────────────────────┐
│ 1. get_github_prs                   │  → Fetch PR/contribution activity
│ 2. resolve_wallet                   │  → Match contributor → Solana wallet
│ 3. get_sol_price                    │  → USD → SOL conversion (CoinGecko)
│ 4. execute_transfer (prepared only) │  → Build transaction for review
└─────────────────────────────────────┘
        ↓
Admin reviews full breakdown
        ↓
Phantom wallet signs → On-chain transfer executes
```

---

## Architecture

### On-Chain (Anchor / Rust)
- **PDA Treasury Account** — Program-controlled shared wallet derived from admin public key
- `initialize_treasury` — Creates the team vault, stores admin pubkey on-chain
- `execute_transfer` — Enforces admin-only authorization at protocol level (not just UI)

### Off-Chain
- **Next.js** — Frontend + API routes
- **Claude API (tool-use)** — Agentic command processing
- **PostgreSQL** — Member registry (GitHub username ↔ Solana wallet address)
- **CoinGecko API** — Live SOL/USD price feed
- **Phantom Wallet** — Transaction signing via Wallet Standard

---

## Security Model

| Layer | Guarantee |
|---|---|
| Smart Contract | Only stored admin pubkey can call `execute_transfer` |
| Agent | Human approval gate — agent prepares, never auto-signs |
| UI | Phantom signs only after admin reviews full breakdown |

---

## Tech Stack

```
Anchor 0.31 / Rust     → On-chain smart contract
Next.js 14             → Frontend + API routes  
Claude API (tool-use)  → AI agent chain
PostgreSQL             → Member/wallet registry
CoinGecko Free API     → SOL price feed
Phantom / Wallet Std   → Wallet connection + signing
Solana Devnet          → Development + demo environment
```

---

## Project Structure

```
Solace/
├── programs/
│   └── solana_agent_treasury/
│       └── src/
│           └── lib.rs          # Anchor smart contract
├── migrations/                 # DB schema + seed
├── tests/                      # Anchor + integration tests
├── Anchor.toml
├── Cargo.toml
└── package.json
```

---

## Roadmap

| Phase | Milestone | Target |
|---|---|---|
| 1 | Anchor smart contract deployed to devnet | Week 1-2 |
| 2 | Phantom wallet connect + manual transfer UI | Week 2-3 |
| 3 | Claude agent tool-use chain integrated | Week 3-4 |
| 4 | GitHub integration + member registry | Week 4-5 |
| 5 | Demo polish + supervisor presentation | Week 5-6 |

**Target ship date: June 1, 2026**

---

## GitHub

[github.com/RahulSH004/Solace](https://github.com/RahulSH004/Solace)

---

## Author

**Rahul** — [@rahul6904](https://x.com/rahul6904) | [github.com/RahulSH004](https://github.com/RahulSH004)

Computer Science student building at the intersection of AI agents and Solana.
