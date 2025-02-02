pragma solidity ^0.8.13;
import {LocalAsyncProxy} from "./LocalAsyncProxy.sol";

// XAddress is a struct that represents an address on a chain
struct XAddress {
    address addr;
    uint256 chainId;
}

// AsyncCall is a struct that represents an async call to a remote contract
// It includes the sender, the recipient, the nonce, and the calldata payload
struct AsyncCall {
    XAddress from;
    XAddress to;
    uint256 nonce;
    bytes data;
}

// AsyncCallback is a struct that represents a callback to a local contract
// It includes the async call ID, a success flag, and the return data
struct AsyncCallback {
    bytes32 asyncCallId;
    bool success;
    bytes returnData;
}

library AsyncUtils {
    function calculateLocalAsyncProxyAddress(address _localAddress, address _remoteAddress, uint256 _chainId) internal pure returns (LocalAsyncProxy) {
        return LocalAsyncProxy(address(uint160(uint(keccak256(abi.encodePacked(
            bytes1(0xff),
            _localAddress,
            bytes32(0),
            keccak256(
                abi.encodePacked(
                    type(LocalAsyncProxy).creationCode,
                    abi.encode(_remoteAddress, _chainId)
                )
            )
        ))))));
    }

    function encodeAsyncCall(AsyncCall memory asyncCall) internal pure returns (bytes memory) {
        return abi.encode(
            asyncCall.from.addr,
            asyncCall.from.chainId,
            asyncCall.to.addr,
            asyncCall.to.chainId,
            asyncCall.nonce,
            asyncCall.data
        );
    }

    function decodeAsyncCall(bytes memory data) internal pure returns (AsyncCall memory) {
    (
        address fromAddr,
        uint256 fromChainId,
            address toAddr,
            uint256 toChainId,
            uint256 nonce,
            bytes memory callData
    ) = abi.decode(data, (address, uint256, address, uint256, uint256, bytes));

    return AsyncCall(
        XAddress(fromAddr, fromChainId),
        XAddress(toAddr, toChainId),
        nonce,
        callData
        );
    }

    function getAsyncCallId(AsyncCall memory asyncCall) internal pure returns (bytes32) {
        return keccak256(abi.encode(
            asyncCall.from.addr,
            asyncCall.from.chainId,
            asyncCall.to.addr,
            asyncCall.to.chainId,
            asyncCall.nonce,
            asyncCall.data
        ));
    }
}
