import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";

// ---------- Contract ---------- //
const contractAddress = "0x769EA2b78a23D3aCa877B4a49e95413F63B840FC";
const contractABI = [
    "function registerDomain(string memory domain) external payable",
    "function deleteDomain(string memory domain) external",
    "function transferToDomain(string memory domain, uint256 value) external payable",
    "function withdrawFees() external",
    "function getContractOwner() public view returns (address)",
    "function getRegistrationFees() public view returns (uint256)"
];

// ---------- Helper Functions ---------- // 
function truncatedAddress(address) {
    return "0x" + address.slice(2, 6).toUpperCase() + "..." + address.slice(-4).toUpperCase();
}

// ---------- HTML Elements ---------- //
const walletBtn = document.querySelector(".wallet");
const copyWalletBtn = document.querySelector(".copyWallet");
const registerDomainBtn = document.querySelector(".register");
const transferBtn = document.querySelector(".transfer");
const withdrawFeesBtn = document.querySelector(".withdraw");
const deleteDomainBtn = document.querySelector(".delete");

const domainNameInput = document.querySelector("#domain-name");
const paymentNameInput = document.querySelector("#payment-target");
const paymentAmountInput = document.querySelector("#payment-amount");
const deleteNameInput = document.querySelector("#delete-name");
const domainWalletInput = document.querySelector("#domain-wallet");
const registrationFeesOutput = document.querySelector(".register-fees");

const adminSession = document.querySelector(".admin-session");

// ---------- Event Listeners ---------- //
walletBtn.addEventListener("click", connectWallet);
copyWalletBtn.addEventListener("click", copyWallet);
registerDomainBtn.addEventListener("click", registerDomain);
transferBtn.addEventListener("click", transfer);

window.onload = (e) => {
    syncWallet();
    syncContract();
    syncAdmin();
}

window.ethereum.on("accountsChanged", () => {
    window.location.reload();
})

// ---------- Event Handlers ---------- //
async function syncWallet() {
    if (!window.ethereum) return;
    const accounts = await ethereum.request({method: "eth_accounts"});
    if (accounts.length > 0) {
        walletBtn.innerHTML = truncatedAddress(accounts[0]);
        walletBtn.disabled = true;
        walletBtn.classList.add("connected");
    }
}

async function syncContract() {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const registrationFees = ethers.formatEther(await contract.getRegistrationFees());
    registrationFeesOutput.innerHTML = registrationFees + " ether";
    
}

async function syncAdmin() {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const contractOwner = await contract.getContractOwner();
    try {
        const isAdmin = (contractOwner.toUpperCase() == (await ethereum.request({method: "eth_accounts"}))[0].toUpperCase());
        if (isAdmin) {
            adminSession.classList.add("isAdmin");
            withdrawFeesBtn.addEventListener("click", withdrawFees);
            deleteDomainBtn.addEventListener("click", deleteDomain);
        }
    }
    catch (error) {
        console.error("[ERROR] message");
    }
}

async function connectWallet() {
    if (!window.ethereum) return;
    await ethereum.request({method: "eth_requestAccounts"});
    syncWallet();
}

async function copyWallet() {
    if (!window.ethereum) return;
    const accounts = await ethereum.request({method: "eth_accounts"});
    if (accounts.length > 0) {
        domainWalletInput.value = accounts[0];
    }
}

async function registerDomain() {
    if (!window.ethereum) return;
    const domainName = domainNameInput.value;
    const walletAddress = domainWalletInput.value;
    const ValidCharacters = /^[a-z]+$/;

    if (!domainName) {
        alert("Please Enter a domain name");
        return;
    }

    if (domainName.length < 5) {
        alert("Domain name must be at least 5 letters long");
        return;
    }

    if (!ValidCharacters.test(domainName)) {
        alert("Domain name must contain only lowercase letters.");
        return;
    }

    if (!ethers.isAddress(walletAddress)) {
        alert("Please enter a valid Ethereum address");
        return;
    }

    alert("Domain name : " + domainName + ".eid" + "is linking to " + walletAddress);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    try {
        const signer = await provider.getSigner();
        const contractWithSigner = contract.connect(signer);
        const fees = await contract.getRegistrationFees();
        
        const tx = await contractWithSigner.registerDomain(domainName + ".eid", {
            value: fees
        });
        await tx.wait();
        console.log("Transaction hash:", tx.hash);
    }
    catch (error) {
        if (error.reason) {
            console.error("[ERROR] Contract execution reverted:", error.reason);
            if (error.reason == "DOMAIN_NOT_AVAILABLE") {
                alert("The domain is not available now. please select other domain");
            }

        } else {
            console.error("[ERROR] Transaction failed:", error.message);
        }
    }
}

async function withdrawFees() {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    try {
        const signer = await provider.getSigner();
        const contractWithSigner = contract.connect(signer);
        const tx = await contractWithSigner.withdrawFees();
        await tx.wait();
        console.log("Transaction hash:", tx.hash);
    }
    catch (error) {
        console.error("[ERROR] Transaction failed:", error.message);
    }
}

async function deleteDomain() {
    if (!window.ethereum) return;
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const signer = await provider.getSigner();
        const contractWithSigner = contract.connect(signer);
        console.log("[DEBUG] CAN")
        const domainName = deleteNameInput.value;
        const tx = await contractWithSigner.deleteDomain(domainName + ".eid");
        await tx.wait();
        console.log("[TX DEBUG] " + tx.hash);
        deleteNameInput.value = "";
    }
    catch(err) {
        if (err.reason) console.log("[TX ERROR] " + err.reason)
        console.log("[ERROR] " + err.message);
    }
}

async function transfer() {
    if (!window.ethereum) return;
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const contractWithSigner = contract.connect(signer);
        const targetAddress = paymentNameInput.value;
        const ValidCharacters = /^[a-z]+$/;

        if (!targetAddress) {
            alert("Please Enter a domain name");
            return;
        }

        const value = paymentAmountInput.value;
        console.log(value);

        if (ethers.isAddress(targetAddress)) {
            try {
                const tx = await signer.sendTransaction({to: targetAddress, value: ethers.parseEther(value)});
                await tx.wait();
                console.log("[TX DEBUG] Transaction hash:", tx.hash);
                paymentNameInput.value = "";
                paymentAmountInput.value = "";
            } catch (error) {
                console.error("[ERROR] Transfer failed:", error.message);
            }
            return;
        }

        if (!targetAddress) {
            alert("Please Enter a domain name");
            return;
        }
    
        if (targetAddress.length < 5) {
            alert("Domain name must be at least 5 letters long");
            return;
        }
    
        if (!ValidCharacters.test(targetAddress)) {
            alert("Domain name must contain only lowercase letters.");
            return;
        }
        
        try {
            try {
                const tx = await contractWithSigner.transferToDomain(
                    targetAddress + ".eid",
                    ethers.parseEther(value),
                    { value: ethers.parseEther(value) }
                );
                await tx.wait();
                console.log("[TX DEBUG] Transaction hash:", tx.hash);
                paymentNameInput.value = "";
                paymentAmountInput.value = "";
            } catch (error) {
                if (error.reason) {
                    console.error("[ERROR] Transfer failed:", error.reason);
                } else {
                    console.error("[ERROR] Transfer failed:", error.message);
                }
                throw error;
            }
        } catch (error) {
            console.error("[ERROR] Transfer failed:", error.message);
        }
        
    }
    catch(err) {
        if (err.reason) console.log("[TX ERROR] " + err.reason)
        console.log("[ERROR] " + err.message);
    }
}