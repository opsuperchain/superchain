
interface myAsyncFunction1Promise {
    function then(function(uint256) external) external;
}
interface RemoteExampleAsyncEnabled {
    function myAsyncFunction1() external returns (myAsyncFunction1Promise);
}
