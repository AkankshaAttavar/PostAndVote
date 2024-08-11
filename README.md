---

# PostAndVote DApp

## Overview

**PostAndVote** is a decentralized application (DApp) that enables users to mint NFT profiles, create posts, and participate in events where they can vote for the best posts. The DApp is built on Ethereum and utilizes IPFS for decentralized storage. A unique feature of this DApp is the integration with Worldcoin, allowing users to prove their unique identity and participate in the platform with confidence.

## Features

- **NFT Profiles**: Users can mint NFT profiles with their username and avatar stored on IPFS.
- **Events and Posts**: Users can join events by paying a participation fee and submitting a post (image with a caption).
- **Voting**: Users can vote on posts during events. After the event ends, the winner is determined and rewarded.
- **Worldcoin Integration**: Users can verify their unique identity using Worldcoin, ensuring that each participant is unique without compromising privacy.
- **Decentralization**: IPFS is used for storing avatars and posts, ensuring decentralized and tamper-proof storage.

## Tech Stack

- **Frontend**: React.js, Bootstrap
- **Backend**: Solidity (Ethereum Smart Contracts)
- **Blockchain Network**: Ethereum
- **Storage**: IPFS via Pinata
- **Web3 Integration**: Ethers.js
- **Identity Verification**: Worldcoin

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js & npm**: Install [Node.js](https://nodejs.org/) (which includes npm).
- **Metamask**: Install [Metamask](https://metamask.io/) browser extension.
- **Hardhat**: For smart contract deployment and testing.
- **Worldcoin App**: [Install the Worldcoin app](https://worldcoin.org/download) to verify your unique identity.

## Setup and Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/PostAndVote.git // not ready yet.
   cd PostAndVote
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env` file in the root directory and add the following:**

   ```env
   REACT_APP_PINATA_API_KEY=your_pinata_api_key
   REACT_APP_PINATA_SECRET_API_KEY=your_pinata_secret_api_key
   ```

4. **Compile and deploy smart contracts:**

   Start the local Hardhat network:
   
   ```bash
   npx hardhat node
   ```

   Deploy the smart contracts:

   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

5. **Update frontend with contract addresses:**

   After deployment, update the `PostandvoteAddress.json` file in the `src/contractsData/` directory with the deployed contract address.

6. **Start the development server:**

   ```bash
   npm start
   ```

   The app will be running on `http://localhost:3000`.

## Worldcoin Integration

**Worldcoin** is a decentralized protocol that enables people to verify their unique identity while preserving privacy. By integrating Worldcoin into PostAndVote, we ensure that each user is unique without revealing any personal information.

### How it works:

1. **Identity Verification**: Users verify their identity using the Worldcoin app before participating in events or minting their NFT profile.
2. **Privacy-Preserving**: Worldcoin uses cryptography to confirm a user's uniqueness without storing any personal data.
3. **Decentralized and Secure**: All verification processes are decentralized, ensuring security and trustworthiness.

To use Worldcoin in the PostAndVote DApp, follow these steps:

1. Install the Worldcoin app from the [official website](https://worldcoin.org/download).
2. Verify your identity using the app.
3. Use the DApp as usual—your unique identity will be verified seamlessly in the background.

## Usage

- **Connect Wallet**: Click on "Connect Wallet" to connect your Metamask account to the DApp.
- **Mint Profile**: Navigate to the "Profile" page to mint your NFT profile. Upload an avatar, set a username, and verify your identity using Worldcoin.
- **Create or Join Events**: On the "Events" page, create new events or join existing ones.
- **Post and Vote**: Once in an event, you can post your content and vote on others.

## Project Structure (Not complete)

```plaintext
PostAndVote/
├── src/
│   ├── components/
│   ├── contractsData/
│   ├── App.js
│   ├── index.js
│   ├── ...
├── scripts/
│   ├── deploy.js
├── contracts/
│   ├── Decentratwitter.sol
├── test/
│   ├── Decentratwitter.test.js
├── hardhat.config.js
├── package.json
├── README.md
└── ...
```

## Smart Contract Overview

The main smart contract is `Decentratwitter.sol` which includes:

- **NFT Minting**: Allows users to mint a profile NFT.
- **Event Creation & Participation**: Users can create events and join them by paying a fee.
- **Voting Mechanism**: Handles voting during the event and finalizes the event by selecting the winner.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -am 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Create a new Pull Request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgements

- [Worldcoin](https://worldcoin.org/) for unique identity verification.
- [Pinata](https://pinata.cloud/) for IPFS integration.
- [OpenZeppelin](https://openzeppelin.com/) for smart contract libraries.
- [Bootstrap](https://getbootstrap.com/) for the frontend design framework.

---