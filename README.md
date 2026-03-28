# ClearFund - Public Fund Tracking System through Blockchain

A comprehensive blockchain-based public fund tracking system designed to bring transparency, security, and accountability to government project funding and execution. ClearFund leverages smart contracts, distributed ledgers, and modern web technologies to ensure that public funds are allocated, tracked, and released only upon verified milestone completion.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Core Functionalities](#core-functionalities)
- [Process Flow](#process-flow)
- [Project Structure](#project-structure)
- [Installation and Setup](#installation-and-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)

## Overview

ClearFund is a decentralized public fund management system that ensures:

- Complete transparency in government fund allocation
- Automated milestone tracking and verification
- Blockchain-based tamper-proof records
- Real-time fund disbursement based on milestone completion
- Multi-party approval mechanisms for fund release
- IPFS-based document storage for immutable proof submission
- AI-powered chat assistance for system navigation

The system is built on a three-tier architecture: Blockchain smart contracts for fund management, Express.js backend for business logic, and a Next.js frontend for user interfaces.

## Key Features

### Government Officials (Fund Creators)
- Create and manage public projects with detailed budgets
- Define milestones with specific amounts and deadlines
- Monitor contractor progress and approvals
- View comprehensive project overviews and analytics
- Extend milestones or adjust timelines as needed

### Contractors (Fund Recipients)
- Accept project bids and manage project timeline
- Submit milestone completion proofs via IPFS
- Track fund release status in real-time
- View historical project participation and earnings
- Communicate with approvers through integrated chat

### Approvers (Inspectors/Validators)
- Review milestone completion proofs and evidence
- Approve or reject milestone submissions with justification
- Participate in multi-signature approval workflows
- Monitor all assigned projects and pending approvals
- Ensure compliance with project specifications

### Smart Contract Features
- Automated milestone tracking with state management
- Multi-threshold approval mechanisms (2-out-of-3 approvals required for fund release)
- Deadline management with extensibility
- Immutable audit trail of all transactions and decisions
- INR-based fund accounting (whole rupees, no token conversions)

## Technology Stack

### Frontend
- Next.js 16.2.1 - React framework for server-side rendering
- React 19.2.4 - UI library
- Ethers.js 6.16.0 - Blockchain interaction library
- Leaflet 1.9.4 & React-Leaflet 5.0.0 - Map visualization
- Lucide-react 1.7.0 - Icon library
- React Markdown 9.0.0 - Content rendering

### Backend
- Express.js 5.2.1 - RESTful API framework
- Ethers.js 6.16.0 - Web3 interaction
- Supabase API Client 2.100.1 - Database operations
- Multer 2.1.1 - File upload handling
- Axios 1.13.6 - HTTP client
- CORS 2.8.6 - Cross-origin resource sharing
- Dotenv 17.3.1 - Environment configuration

### Blockchain
- Solidity 0.8.20 - Smart contract language
- Hardhat 2.28.6 - Development environment
- Ethers.js 6.16.0 - Blockchain interaction
- Nomics Foundation Hardhat Toolbox - Testing toolkit

### Database
- Supabase - PostgreSQL-based backend
- IPFS - Distributed file storage for proof submission

## System Architecture

```
User Interfaces (Frontend - Next.js)
        |
        v
RESTful API Layer (Backend - Express.js)
        |
        +---> Database Layer (Supabase PostgreSQL)
        |
        +---> Blockchain Layer (Smart Contracts)
        |           |
        |           +---> ProjectEscrow Contracts
        |           |
        |           +---> Factory Contract
        |
        +---> External Services
                |
                +---> IPFS (Document Storage)
                |
                +---> LLM Service (AI Chat)
```

## Core Functionalities

### 1. Authentication & User Management
- Wallet-based authentication (MetaMask integration)
- User role management (Government, Contractor, Approver)
- Session validation and token management
- User profile endpoints for profile retrieval

### 2. Project Management
- Create new projects with detailed specifications
- Specify project milestones with amounts (in INR) and deadlines
- Assign approvers to projects (multiple signers)
- Update project status and metadata
- Track project lifecycle from creation to completion
- Retrieve project overviews with statistics

### 3. Bidding System
- Contractors submit bids for projects
- Bid contains milestone breakdown with costs and timelines
- Government can approve or reject bids
- Selected contractor becomes project executor
- Historical bid tracking for transparency

### 4. Milestone Tracking
- Milestones structured with amount, deadline, and proof requirements
- Contractors submit proof of completion (IPFS hash)
- Each milestone tracks:
  - Submission status
  - Approval count (approvals required = threshold)
  - Rejection count
  - Release status
  - Per-approver voting status

### 5. Multi-Signature Approval
- Configurable approval threshold (default: 2-out-of-3 approvers)
- Approvers vote to approve or reject milestones
- Rejection mechanism with round tracking to prevent replay attacks
- Majority approval required for fund release
- Automatic fund release upon reaching threshold

### 6. Fund Release Mechanism
- Automatic INR amount tracking (no token conversion)
- FundsReleased event emitted for off-chain bank processing
- Releasable amount calculation based on approved milestones
- Treasury integration ready for banking APIs
- Complete audit trail of all fund movements

### 7. Document & Proof Storage
- IPFS integration for storing milestone completion proofs
- Immutable document hashing and verification
- Support for multiple file types (documents, images, reports)
- Permanent records of all submission evidence

### 8. Chat & Communication
- Real-time messaging between contractors and approvers
- AI-powered chatbot assistance (LLM integration)
- Context-aware responses for system navigation
- Message history and conversation tracking

### 9. Event Listening & Monitoring
- Real-time blockchain event listeners
- Automatic project monitoring after deployment
- Event tracking for:
  - Proof submissions
  - Approvals and rejections
  - Fund releases
  - Deadline extensions

### 10. Data Management
- Supabase integration for persistent data storage
- Tables for users, projects, bids, approvals, milestones
- Real-time database synchronization
- Query optimization for dashboard analytics

## Process Flow

### Project Creation Flow
```
1. Government Official Login
   |
   v
2. Create Project Form
   - Define project name, description, budget
   - Create milestones with amounts and deadlines
   - Select 2-3 approvers for the project
   |
   v
3. Deploy Smart Contract
   - Factory contract deploys ProjectEscrow contract
   - Pass government address, contractor (TBD), approvers, milestones, threshold
   - Store contract address in database
   |
   v
4. Await Contractors Bids
   - Project available for contractor bidding
   - Approvers assigned and notified
```

### Bid & Project Execution Flow
```
1. Contractor Views Available Projects
   |
   v
2. Contractor Submits Bid
   - Provide milestone breakdown matching project specs
   - Quote costs for each milestone
   - Propose timeline
   |
   v
3. Government Reviews Bid
   - Evaluates contractor qualifications
   - Reviews cost breakdown
   - Approves or rejects bid
   |
   v
4. If Bid Approved:
   - Contractor address mapped to ProjectEscrow contract
   - Project transitions to execution phase
   - Contractor can begin milestone work
```

### Milestone Execution & Approval Flow
```
1. Contractor Completes Milestone Work
   |
   v
2. Contractor Submits Proof
   - Uploads completion evidence (documents, images, reports)
   - IPFS generates hash for immutable storage
   - Updates ProjectEscrow.submitProof(milestoneId, ipfsHash)
   - Transaction recorded on blockchain
   |
   v
3. ProofSubmitted Event Triggered
   - Approvers notified of pending review
   - Milestone locked for voting period
   |
   v
4. Approvers Review Evidence
   - Access submission details via dashboard
   - Review IPFS-stored documents
   - Assess completion against specifications
   |
   v
5. Approval Voting
   - Each assigned approver votes (approve/reject)
   - Transaction: approveProof(milestoneId) or rejectProof(milestoneId)
   - Contract tracks per-approver voting to prevent double voting
   |
   v
6. Threshold Evaluation
   - If approvals >= threshold (2-out-of-3):
       - Call releaseFunds(milestoneId)
       - FundsReleased event emitted with INR amount
       - Off-chain banking system initiates bank transfer
   - If rejections > remaining approvers:
       - Milestone returned to contractor for resubmission
       - Submission round incremented to prevent replay attacks
   |
   v
7. Fund Disbursement
   - Treasury receives FundsReleased event data
   - Banking API confirms contractor bank transfer
   - Database updated with release confirmation
   - Contractor receives notification
```

### Exception Handling Flow
```
1. Milestone Deadline Approaches:
   - Contractor can request deadline extension
   - Government approves or denies extension
   - If denied and deadline passed: milestone marked overdue
   
2. Milestone Rejected by Approvers:
   - Contractor receives rejection notification
   - Feedback provided (approval comments/reasons)
   - Can resubmit proof with improvements
   - Submission round incremented
   
3. Communication During Process:
   - Contractor uses chat to ask approvers for clarifications
   - AI chatbot provides guidance on system usage
   - Message history maintained in database for audit trail
```

### End-to-End Scenario Example
```
Day 1 - Project Creation:
- Government creates "Road Construction Project" worth 50 lakhs (50,00,000 INR)
- 3 milestones defined:
  * Milestone 1 (Week 4): Site preparation - 15,00,000 INR
  * Milestone 2 (Week 8): Foundation work - 20,00,000 INR
  * Milestone 3 (Week 12): Final completion - 15,00,000 INR
- 3 approvers assigned: Inspector A, Inspector B, Engineer C
- Smart contract deployed with threshold = 2

Day 5 - Bidding:
- Contractor XYZ submits bid matching milestone structure
- Government approves bid after review
- Contractor assigned to project
- Project execution phase begins

Week 4 - First Milestone:
- Contractor XYZ completes site preparation
- Submits GPS coordinates, site photos, survey reports via IPFS
- All approvers receive notification
- Inspector A approves proof
- Inspector B approves proof
- Threshold reached (2/3 approvals)
- FundsReleased event for 15,00,000 INR
- Bank transfer initiated by treasury system
- Contractor receives funds

Week 8 & 12 - Subsequent Milestones:
- Process repeats for remaining milestones
- Each release tracked on immutable blockchain ledger
- Complete audit trail maintained

Project Completion:
- All 50,00,000 INR released across 3 milestones
- Government has complete transparency on work progress
- No fraud possible (all decisions recorded on blockchain)
- Citizens can verify fund usage through public ledger
```

## Project Structure

```
ClearFund/
├── README.md                              (This file)
├── FILE_STRUCTURE.md                      (Detailed file mappings)
├── LICENSE
│
├── frontend/                              (Next.js Web Application)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.js                  (Root layout)
│   │   │   ├── page.js                    (Home page)
│   │   │   ├── (sidebar)/
│   │   │   │   ├── layout.js              (Sidebar layout)
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.js            (Main dashboard)
│   │   │   │   ├── approver/              (Approver routes)
│   │   │   │   ├── contractor/            (Contractor routes)
│   │   │   │   ├── gov/                   (Government routes)
│   │   │   │   └── public/                (Public routes)
│   │   │   ├── chat/
│   │   │   │   └── page.js                (Chat page)
│   │   │   └── gate/
│   │   │       └── page.js                (Access control)
│   │   │
│   │   └── components/
│   │       ├── SignerDashboard.jsx        (Approver dashboard)
│   │       ├── chat/
│   │       │   ├── ChatInterface.jsx      (Main chat UI)
│   │       │   └── ChatButton.jsx         (Chat trigger)
│   │       ├── contractor-dashboard/      (Contractor UI)
│   │       ├── gov/
│   │       │   └── CreateProjectForm.jsx  (Project creation)
│   │       ├── LoginCard/                 (Authentication)
│   │       └── wallet/
│   │           └── MetaMaskConnect.jsx    (Web3 connection)
│   │
│   ├── package.json
│   └── next.config.mjs
│
├── backend/                               (Express.js API Server)
│   ├── src/
│   │   ├── index.js                       (Server entry point)
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.js                    (Authentication endpoints)
│   │   │   ├── projects.js                (Project CRUD)
│   │   │   ├── bids.js                    (Bidding system)
│   │   │   ├── contractor.js              (Contractor operations)
│   │   │   ├── signer.js                  (Approver operations)
│   │   │   ├── upload.js                  (File uploads)
│   │   │   └── chat.js                    (ChatAPI)
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js          (Login logic)
│   │   │   ├── projectController.js       (Project logic)
│   │   │   ├── bidController.js           (Bid logic)
│   │   │   ├── contractorController.js    (Contractor logic)
│   │   │   ├── signerController.js        (Approver logic)
│   │   │   ├── uploadController.js        (Upload logic)
│   │   │   └── chatController.js          (Chat logic)
│   │   │
│   │   ├── services/
│   │   │   ├── ipfs.js                    (IPFS integration)
│   │   │   ├── llmService.js              (AI chatbot)
│   │   │   └── dbService.js               (Database service)
│   │   │
│   │   ├── db/
│   │   │   └── supabaseClient.js          (Database client)
│   │   │
│   │   ├── listeners/
│   │   │   └── events.js                  (Blockchain event listeners)
│   │   │
│   │   ├── utils/
│   │   │   └── idGenerator.js             (ID generation)
│   │   │
│   │   └── web3/
│   │       └── factory.js                 (Smart contract interaction)
│   │
│   ├── abi/
│   │   ├── Factory.json                   (Factory ABI)
│   │   └── ProjectEscrow.json             (ProjectEscrow ABI)
│   │
│   ├── package.json
│   └── .env                               (Environment variables)
│
├── blockchain/                            (Smart Contracts)
│   ├── contracts/
│   │   ├── Factory.sol                    (Project deployment factory)
│   │   └── ProjectEscrow.sol              (Milestone management contract)
│   │
│   ├── ignition/
│   │   └── modules/
│   │       └── Lock.js                    (Deployment module)
│   │
│   ├── scripts/
│   │   └── deploy.js                      (Deployment script)
│   │
│   ├── test/
│   │   └── Lock.js                        (Contract tests)
│   │
│   ├── hardhat.config.js                  (Hardhat configuration)
│   ├── package.json
│   └── README.md
│
└── shared/
    ├── config.js                          (Shared configuration)
    ├── constants.js                       (Shared constants)
    └── types.js                           (Type definitions)
```

## Installation and Setup

### Prerequisites
- Node.js 16+ and npm/yarn
- MetaMask browser extension
- Git
- Ethereum testnet account (Sepolia recommended)
- Supabase account and project
- IPFS node or Pinata account
- Python 3.8+ (for LLM service, optional)

### Environment Configuration

1. Backend (.env file in `/backend`):
```
PORT=5000
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ALCHEMY_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_api_key
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
LLM_API_KEY=your_llm_api_key
LLM_API_URL=https://api.openai.com/v1
```

2. Frontend (.env.local file in `/frontend`):
```
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_FACTORY=0x...deployed_factory_address...
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### Install Dependencies

Frontend:
```bash
cd frontend
npm install
npm run build
```

Backend:
```bash
cd backend
npm install
```

Blockchain:
```bash
cd blockchain
npm install
npx hardhat compile
```

## Running the Application

### 1. Deploy Smart Contracts

```bash
cd blockchain
npx hardhat run scripts/deploy.js --network sepolia
```

Note the Factory contract address and add to frontend environment.

### 2. Start Backend Server

```bash
cd backend
npm start
```

Server will run on http://localhost:5000

### 3. Start Frontend Application

```bash
cd frontend
npm run dev
```

Application will run on http://localhost:3000

### 4. Connect MetaMask
- Install MetaMask extension
- Switch to Sepolia testnet
- Connect to http://localhost:3000
- Login with your wallet

## API Endpoints

### Authentication
- `POST /auth/login` - Wallet-based login

### Projects
- `POST /projects/create` - Create new project (Government only)
- `GET /projects` - Retrieve all projects
- `GET /projects/:id` - Get specific project details
- `GET /projects/overview` - Get project statistics and overview

### Bids
- `POST /bids/submit` - Submit project bid (Contractor)
- `GET /bids/:projectId` - Get project bids (Government)
- `PUT /bids/:bidId/approve` - Approve bid (Government)
- `PUT /bids/:bidId/reject` - Reject bid (Government)

### Milestones & Approvals
- `POST /signer/approve` - Approve milestone (Approver)
- `POST /signer/reject` - Reject milestone (Approver)
- `GET /signer/pending` - Get pending approvals

### Contractor Operations
- `POST /contractor/submit-proof` - Submit milestone proof
- `GET /contractor/projects` - Get contractor projects
- `PUT /contractor/request-extension` - Request deadline extension

### File Upload
- `POST /upload` - Upload files to IPFS

### Chat
- `POST /api/chat/message` - Send message to AI chatbot

## API Health Check
- `GET /health` - Server health status

---

## Security Considerations

- All transactions are recorded on immutable blockchain ledger
- Multi-signature approval prevents single point of failure
- IPFS ensures documents cannot be retroactively altered
- Wallet authentication provides cryptographic verification
- Smart contracts are gas-optimized and audit-ready
- Database access controlled through Supabase RLS policies

## Future Enhancements

- Integration with national payment gateways for automated bank transfers
- Mobile application for approvers on field
- Advanced analytics and data visualization
- DAO governance for fund allocation decisions
- Integration with other government systems
- Automated reporting for compliance and audits

## License

This project is licensed under the ISC License - see LICENSE file for details.

## Support & Documentation

For detailed file-specific integration maps, see FILE_STRUCTURE.md
For blockchain contract details, see blockchain/README.md
For frontend documentation, see frontend/README.md