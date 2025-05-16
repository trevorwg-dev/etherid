import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";

const hasWalletProvider = () => window.ethereum ? true : false;

const walletElement = document.querySelector(".wallet");
const addressLoaderElement = document.querySelector(".addressLoader");
const domainAddressElement = document.querySelector("#domain-wallet");

walletElement.addEventListener("click", connectWallet);
addressLoaderElement.addEventListener("click", loadAddress);
window.onload = (e) => {
    syncWallet();
}

async function syncWallet() {
    if (!hasWalletProvider()) return;
    const accounts = await ethereum.request({method : "eth_accounts"});
    if (accounts.length > 0) {
        walletElement.innerHTML = truncatedAddress(accounts[0]);
        walletElement.disabled = true;
        walletElement.classList.add("connected");
    }
}

async function connectWallet() {
    if (!hasWalletProvider()) return;
    await ethereum.request({method: "eth_requestAccounts"});
    syncWallet();
}

async function loadAddress() {
    if (!hasWalletProvider()) return;
    const accounts = await ethereum.request({method : "eth_accounts"});
    if (accounts.length > 0) {
        domainAddressElement.value = accounts[0];
    }
}

function truncatedAddress(address) {
    return "0x" + address.slice(2, 6).toUpperCase() + "..." + address.slice(-4).toUpperCase();
}