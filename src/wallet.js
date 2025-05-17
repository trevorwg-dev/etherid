import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";

// Contract

// Helper Functions
const hasWalletProvider = () => window.ethereum ? true : false;

function truncatedAddress(address) {
    return "0x" + address.slice(2, 6).toUpperCase() + "..." + address.slice(-4).toUpperCase();
}

// HTML Elements
const walletButton = document.querySelector(".wallet");
const copyWalletButton = document.querySelector(".copyWallet");
const domainWalletInput = document.querySelector("#domain-wallet");

// Events
walletButton.addEventListener("click", connectWallet);
copyWalletButton.addEventListener("click", getWallet);

window.onload = (e) => {
    syncWallet();
}

window.ethereum.on("accountsChanged", () => {
    window.location.reload();
})

// Event Handlers
async function syncWallet() {
    if (!hasWalletProvider()) return;
    const accounts = await ethereum.request({method: "eth_accounts"});
    if (accounts.length > 0) {
        walletButton.innerHTML = truncatedAddress(accounts[0]);
        walletButton.disabled = true;
        walletButton.classList.add("connected");
    }
}

async function connectWallet() {
    if (!hasWalletProvider()) return;
    await ethereum.request({method: "eth_requestAccounts"});
    syncWallet();   
}

async function getWallet() {
    if (!hasWalletProvider()) return;
    const accounts = await ethereum.request({method: "eth_accounts"});
    if (accounts.length > 0) {
        domainWalletInput.value = accounts[0];
    }
}