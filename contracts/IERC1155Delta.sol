// SPDX-License-Identifier: MIT
// Creator: Ctor Lab (https://ctor.xyz)

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";

interface IERC1155Delta is IERC1155, IERC1155MetadataURI {
    function isOwnerOf(address account, uint256 id) external view returns(bool);

}