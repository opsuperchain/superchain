// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TestContract {
    uint256 public x;

    constructor(uint256 _initialValue) {
        x = _initialValue;
    }

    function setX(uint256 _x) public {
        x = _x;
    }
} 