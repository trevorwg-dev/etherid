// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EtherID {
    address public contractOwner;
    mapping(string => address) public addressOf;
    uint256 public registrationFees = 0.001 ether;

    event DOMAIN_REGISTERED(string domain, address owner);
    event DOMAIN_DELETED(string domain);
    event FEES_WITHDRAWED(uint256 balance);
    event PAYMENT_TRANSFERED(string domain, uint256 value);
    
    constructor() {
        contractOwner = msg.sender;
    }

    modifier isContractOwner() {
        require(msg.sender == contractOwner, "PERMISSION_OWNER_ONLY");
        _;
    }

    modifier isDomainOwner(string memory domain) {
        require(msg.sender == addressOf[domain], "PERMISSION_DOMAIN_OWNER_ONLY");
        _;
    }

    modifier isDomainAvailable(string memory domain) {
        require(addressOf[domain] == address(0), "DOMAIN_NOT_AVAILABLE");
        _;
    }

    modifier existDomain(string memory domain) {
        require(addressOf[domain] != address(0), "DOMAIN_NOT_FOUND");
        _;
    }

    function registerDomain(string memory domain) external payable isDomainAvailable(domain) {
        require(msg.value >= registrationFees, "FEES_INSUFFICIENT");
        addressOf[domain] = msg.sender;
        if (msg.value > registrationFees) { payable(msg.sender).transfer(msg.value - registrationFees); }
        emit DOMAIN_REGISTERED(domain, msg.sender);
    }

    function deleteDomain(string memory domain) external isContractOwner existDomain(domain) {
        addressOf[domain] = address(0);
        emit DOMAIN_DELETED(domain);
    }

    function transferToDomain(string memory domain, uint256 value) external payable existDomain(domain) {
        require(msg.value >= value, "FEES_INSUFFICIENT");
        payable(addressOf[domain]).transfer(value);
        if (msg.value > value) {
            payable(msg.sender).transfer(msg.value - value);
        }
        emit PAYMENT_TRANSFERED(domain, value);
    }

    function withdrawFees() external isContractOwner {
        uint256 balance = address(this).balance;
        payable(contractOwner).transfer(balance);
        emit FEES_WITHDRAWED(balance);
    }
    function getContractOwner() public view returns (address) {
        return contractOwner;
    }

    function getRegistrationFees() public view returns (uint256) {
        return registrationFees;
    }
}