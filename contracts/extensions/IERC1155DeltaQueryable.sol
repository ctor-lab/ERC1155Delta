// SPDX-License-Identifier: MIT
// Creator: Ctor Lab (https://ctor.xyz)

pragma solidity ^0.8.0;



interface IERC1155DeltaQueryable {

    function balanceOf(address owner) external view returns (uint256);

    function balanceOf(address owner, uint256 start, uint256 stop) external view returns (uint256);

    function tokensOfOwnerIn(
        address owner,
        uint256 start,
        uint256 stop
    ) external view returns (uint256[] memory);

    function tokensOfOwner(address owner) external view returns (uint256[] memory);
    
}