// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Candidate contract for TESTING. Not authorized for mainnet deployment.
// Soul is an identity/provenance primitive, separate from the Souls currency.

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ArchonSoul is ERC721 {
    uint256 private _nextTokenId = 1;

    mapping(address => uint256) public soulOf;
    mapping(uint256 => bytes32) public provenanceHash;

    error AlreadyHasSoul();
    error SoulIsNonTransferable();

    event SoulCreated(address indexed steward, uint256 indexed tokenId, bytes32 provenanceHash);
    event ProvenanceUpdated(uint256 indexed tokenId, bytes32 previousHash, bytes32 newHash);

    constructor() ERC721("Archon Soul", "SOUL") {}

    function createSoul(bytes32 initialProvenanceHash) external returns (uint256 tokenId) {
        if (soulOf[msg.sender] != 0) revert AlreadyHasSoul();

        tokenId = _nextTokenId++;
        soulOf[msg.sender] = tokenId;
        provenanceHash[tokenId] = initialProvenanceHash;
        _safeMint(msg.sender, tokenId);

        emit SoulCreated(msg.sender, tokenId, initialProvenanceHash);
    }

    function updateProvenance(bytes32 newHash) external {
        uint256 tokenId = soulOf[msg.sender];
        require(tokenId != 0, "NO_SOUL");
        bytes32 previous = provenanceHash[tokenId];
        provenanceHash[tokenId] = newHash;
        emit ProvenanceUpdated(tokenId, previous, newHash);
    }

    function transferFrom(address, address, uint256) public pure override {
        revert SoulIsNonTransferable();
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert SoulIsNonTransferable();
    }
}
