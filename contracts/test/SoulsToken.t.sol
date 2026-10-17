// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {SoulsToken} from "../src/SoulsToken.sol";

contract SoulsTokenTest is Test {
    SoulsToken token;
    address admin = address(0xA11CE);
    address treasury = address(0xBEEF);
    address visitor = address(0xCAFE);

    function setUp() public {
        token = new SoulsToken(admin, treasury, 1_000_000 ether, 100_000 ether);
    }

    function testInitialSupplyAndCap() public view {
        assertEq(token.totalSupply(), 100_000 ether);
        assertEq(token.balanceOf(treasury), 100_000 ether);
        assertEq(token.cap(), 1_000_000 ether);
    }

    function testOnlyMinterCanMint() public {
        vm.expectRevert();
        token.mint(visitor, 1 ether);

        vm.prank(admin);
        token.mint(visitor, 1 ether);
        assertEq(token.balanceOf(visitor), 1 ether);
    }

    function testCapCannotBeExceeded() public {
        vm.prank(admin);
        vm.expectRevert();
        token.mint(visitor, 900_001 ether);
    }

    function testPauseStopsTransfers() public {
        vm.prank(admin);
        token.mint(visitor, 10 ether);

        vm.prank(admin);
        token.pause();

        vm.prank(visitor);
        vm.expectRevert();
        token.transfer(treasury, 1 ether);
    }
}
