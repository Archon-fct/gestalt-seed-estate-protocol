// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Candidate contract for TESTING. Not authorized for mainnet deployment.
// OpenZeppelin Contracts v5.x is expected as a pinned project dependency.

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {ERC20Pausable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract SoulsToken is ERC20, ERC20Capped, ERC20Pausable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    error ZeroAddress();
    error InitialSupplyExceedsCap();

    constructor(
        address admin,
        address treasury,
        uint256 cap_,
        uint256 initialSupply_
    )
        ERC20("Souls", "SOULS")
        ERC20Capped(cap_)
    {
        if (admin == address(0) || treasury == address(0)) revert ZeroAddress();
        if (initialSupply_ > cap_) revert InitialSupplyExceedsCap();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);

        if (initialSupply_ != 0) {
            _mint(treasury, initialSupply_);
        }
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Capped, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}
