# EtherID - Decentralized DNS for Ethereum Wallets

## Project Overview
EtherID is a decentralized application (dApp) that provides DNS-like services for Ethereum wallets. It allows users to register human-readable domain names that map to Ethereum addresses, making it easier to send and receive cryptocurrency without dealing with long, complex addresses.

## Features
- Domain registration with human-readable names
- Secure domain ownership management
- Direct cryptocurrency transfers using domain names
- Owner-only domain deletion capability
- Registration fee system with owner withdrawal functionality

## Technical Stack
- **Smart Contract**: Solidity (^0.8.0)
- **Frontend**: HTML, CSS, JavaScript
- **Blockchain**: Ethereum Network
- **Web3 Integration**: Web3.js

## Project Structure
```
etherid/
├── contracts/
│   └── EtherID.sol         # Main smart contract
├── src/
│   ├── dapp.js            # Frontend application logic
│   └── style.css          # Styling
└── index.html             # Main application interface
```

## Smart Contract Features
- Domain registration with fee system
- Domain ownership verification
- Secure payment transfers
- Owner-only administrative functions
- Event logging for all major operations

## Getting Started
1. Clone the repository
2. Install dependencies
3. Deploy the smart contract to your preferred Ethereum network
4. Update the contract address in the dapp.js
5. Run the application locally

## Security Features
- Owner-only access control
- Domain availability checks
- Secure payment handling
- Input validation
- Event logging for transparency

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Course Information
This project was developed for COMP4541.
