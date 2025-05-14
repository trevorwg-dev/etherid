// Imports
import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";

// States
var isWalletConnect = false;

// Elements
const walletElement = document.querySelector(".wallet");

// Event Listeners
walletElement.addEventListener('click', connectWallet);

window.onload = (event) => {
    syncWallet();
}

// Event Handlers
async function syncWallet() {
    if (!existWalletProvider()) return;
    const wallets = await ethereum.request({method: "eth_accounts"});
    if (wallets.length != 0) {
        isWalletConnect = true;
        walletElement.innerHTML = truncatedAddress(wallets[0]);
        walletElement.disabled = true;
        walletElement.classList.add("wallet-connected");
        
        console.log("[DEBUG] Wallet(s) connected.");
        for (let idx = 0; idx < wallets.length; ++idx) {
            const wallet = wallets[idx];
            console.log(`[DEBUG] Wallet Address ${wallet} detcted.`);
            console.log(`[DEBUG] Wallet Balance : ${await getWalletBalance(wallet)} ETH`);
        }
    }
    else {
        isWalletConnect = false;
        walletElement.innerHTML = "Connect Wallet";

        console.log("[DEBUG] Wallet is not connected.");
    }
}

async function connectWallet() {
    if (!existWalletProvider()) return;
    await ethereum.request({method: "eth_requestAccounts"});
    syncWallet();
}

// Helper Functions
function truncatedAddress(address) {
    return address.slice(0, 6).toUpperCase() + "..." + address.slice(-4).toUpperCase();
}

async function getWalletBalance(address) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(address); 
    return ethers.formatEther(balance);
}

function existWalletProvider() {
    if (window.ethereum) return true;
    return false;
}