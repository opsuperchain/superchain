// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;
import {RemoteExampleAsyncEnabled, myAsyncFunction1Promise} from "./interface/async/RemoteExampleAsyncEnabled.sol";
import {AsyncEnabled} from "../src/AsyncEnabled.sol";

// and assume that we want to create an async contract as follows:
contract ExampleAsyncEnabled is AsyncEnabled {
    uint256 immutable valueToReturnAsync;
    uint256 public lastValueReturned;

    constructor(uint256 _valueToReturn) {
        valueToReturnAsync = _valueToReturn;
    }

    function myAsyncFunction1() external async returns (uint256) {
        return valueToReturnAsync;
    }

    function setValue(uint256 _value) external asyncCallback {
        lastValueReturned = _value;
    }

    function makeAsyncCallAndStore(address _toAddress, uint256 _toChainId) external {
        RemoteExampleAsyncEnabled remote = RemoteExampleAsyncEnabled(getAsyncProxy(_toAddress, _toChainId));
        myAsyncFunction1Promise myPromise = remote.myAsyncFunction1();
        myPromise.then(this.setValue);
    }
}
