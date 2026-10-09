// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ArchonSoul} from "../src/ArchonSoul.sol";

contract ArchonSoulTest is Test {
    ArchonSoul soul;
    address visitor = address(0xCAFE);
    address other = address(0xBEEF);

    function setUp() public {
        soul = new ArchonSoul();
    }

    function testVisitorCreatesOneSoul() public {
        vm.prank(visitor);
        uint256 id = soul.createSoul(keccak256("first provenance"));
        assertEq(soul.ownerOf(id), visitor);
        assertEq(soul.soulOf(visitor), id);

        vm.prank(visitor);
        vm.expectRevert();
        soul.createSoul(keccak256("second"));
    }

    function testSoulCannotTransfer() public {
        vm.prank(visitor);
        uint256 id = soul.createSoul(keccak256("first provenance"));

        vm.prank(visitor);
        vm.expectRevert();
        soul.transferFrom(visitor, other, id);
    }

    function testStewardCanUpdateProvenance() public {
        bytes32 first = keccak256("first");
        bytes32 second = keccak256("second");

        vm.prank(visitor);
        uint256 id = soul.createSoul(first);

        vm.prank(visitor);
        soul.updateProvenance(second);
        assertEq(soul.provenanceHash(id), second);
    }
}
