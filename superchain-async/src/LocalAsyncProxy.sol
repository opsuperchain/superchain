pragma solidity ^0.8.13;
import {AsyncPromise} from "./AsyncPromise.sol";
import {AsyncUtils, AsyncCall, XAddress} from "./AsyncUtils.sol";
import {SuperchainEnabled} from "./SuperchainEnabled.sol";
import {AsyncEnabled} from "./AsyncEnabled.sol";

// An LocalAsyncProxy is a local representation of a contract on a remote chain.
// Calling an LocalAsyncProxy triggers an authenticated call to an async function,
// on the remote chain and returns a local Promise contract,
// which will eventually trigger a local callback with the return value of the remote async call.
contract LocalAsyncProxy is SuperchainEnabled {
    // address and chainId of the remote contract triggered by calling this local proxy
    XAddress internal remoteXAddress;
    // address of local contract which can call this remote proxy to send async calls
    address public localAddress;
    // nonce for promises made by this remote proxy
    uint256 public nonce = 0;
    // mapping of nonce to promise
    mapping(uint256 => AsyncPromise) public promisesByNonce;
    // mapping of callId to promise
    mapping(bytes32 => AsyncPromise) public promisesById;

    // TODO: This MVP has the local contract deploy its proxies.
    // This has the advantage that the local contract must be AsyncEnabled,
    // but has the disadvantage that the remote contract is not (e.g. if non-CREATE2).
    // Consider using a generic CREATE2, or requiring the remote contract to
    // confirm it is also AsyncEnabled somehow.
    constructor(address _remoteAddress, uint256 _chainId) {
        remoteXAddress = XAddress(_remoteAddress, _chainId);
        localAddress = msg.sender;
    }

    function getRemoteXAddress() external view returns (XAddress memory) {
        return remoteXAddress;
    }

    // An async proxy will take an arbitrary calldata payload, 
    // and create a promise contract to call the remote contract with that payload.
    // The promise will be returned to the caller, who can then use it to attach a callback.
    fallback(bytes calldata data) external returns (bytes memory) {
        // The sender of the call is the local contract, which is itself on the local chain
        XAddress memory fromContract = XAddress(msg.sender, block.chainid);

        // The async call is to the remote contract, on the remote chain
        AsyncCall memory asyncCall = AsyncCall(
            fromContract,
            remoteXAddress,
            nonce,
            data
        );

        // TODO: duplicate calls with have the same ID, do we like that or no?
        bytes32 callId = AsyncUtils.getAsyncCallId(asyncCall);

        // Create a promise contract to hold record of the async call and its callback
        AsyncPromise promiseContract = new AsyncPromise(msg.sender, remoteXAddress.addr, callId);
        
        // Store and increment promise nonce
        promisesByNonce[nonce] = promiseContract;
        promisesById[callId] = promiseContract;
        nonce++;

        // Encode the async call to AsyncEnabled.relayAsyncCall
        bytes memory relayCallPayload = abi.encodeWithSelector(
            AsyncEnabled.relayAsyncCall.selector,
            asyncCall
        );

        // Send the async call to the remote contract
        _xMessageContract(
            remoteXAddress.chainId,
            remoteXAddress.addr,
            relayCallPayload
        );

        // Return the promise contract address to the caller
        return abi.encodePacked(bytes32(uint256(uint160(address(promiseContract)))));
    }
}
