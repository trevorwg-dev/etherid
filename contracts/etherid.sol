// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EtherID {
    address public owner;

    constructor() {
        owner = msg.sender;
    }
}

contract EtherID_generate {
    // State variables
    address public owner;
    mapping(string => address) public domainToOwner;
    mapping(string => uint256) public domainExpiryTime;
    uint256 public constant REGISTRATION_PERIOD = 365 days;
    uint256 public registrationFee = 0.01 ether;

    // Events
    event DomainRegistered(string domain, address owner, uint256 expiryTime);
    event DomainRenewed(string domain, address owner, uint256 expiryTime);
    event DomainTransferred(string domain, address previousOwner, address newOwner);
    event RegistrationFeeChanged(uint256 oldFee, uint256 newFee);

    // Constructor
    constructor() {
        owner = msg.sender;
    }

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }

    modifier domainAvailable(string memory domain) {
        require(domainToOwner[domain] == address(0) || block.timestamp > domainExpiryTime[domain], "Domain is already registered");
        _;
    }

    modifier domainOwner(string memory domain) {
        require(domainToOwner[domain] == msg.sender, "You don't own this domain");
        _;
    }

    // Functions
    function registerDomain(string memory domain) external payable domainAvailable(domain) {
        require(msg.value >= registrationFee, "Insufficient payment");
        
        domainToOwner[domain] = msg.sender;
        domainExpiryTime[domain] = block.timestamp + REGISTRATION_PERIOD;
        
        // Refund excess payment
        if (msg.value > registrationFee) {
            payable(msg.sender).transfer(msg.value - registrationFee);
        }
        
        emit DomainRegistered(domain, msg.sender, domainExpiryTime[domain]);
    }
    
    function renewDomain(string memory domain) external payable domainOwner(domain) {
        require(msg.value >= registrationFee, "Insufficient payment");
        
        domainExpiryTime[domain] = domainExpiryTime[domain] + REGISTRATION_PERIOD;
        
        // Refund excess payment
        if (msg.value > registrationFee) {
            payable(msg.sender).transfer(msg.value - registrationFee);
        }
        
        emit DomainRenewed(domain, msg.sender, domainExpiryTime[domain]);
    }
    
    function transferDomain(string memory domain, address newOwner) external domainOwner(domain) {
        require(newOwner != address(0), "Cannot transfer to zero address");
        
        address previousOwner = domainToOwner[domain];
        domainToOwner[domain] = newOwner;
        
        emit DomainTransferred(domain, previousOwner, newOwner);
    }
    
    function getDomainOwner(string memory domain) external view returns (address) {
        if (block.timestamp > domainExpiryTime[domain]) {
            return address(0); // Domain has expired
        }
        return domainToOwner[domain];
    }
    
    function getDomainExpiry(string memory domain) external view returns (uint256) {
        return domainExpiryTime[domain];
    }
    
    function setRegistrationFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = registrationFee;
        registrationFee = newFee;
        emit RegistrationFeeChanged(oldFee, newFee);
    }
    
    function withdrawFunds() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
