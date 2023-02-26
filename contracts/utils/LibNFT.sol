// SPDX-License-Identifier: MIT
// Creator: Ctor Lab (https://ctor.xyz)

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../IERC1155Delta.sol";

library LibNFT {
    function isERC1155Delta(address nft) internal view returns (bool) {
        return IERC165(nft).supportsInterface(type(IERC1155Delta).interfaceId);
    }

    function safeTransferFrom(address nft, address from, address to, uint256 tokenId) internal {
        if (isERC1155Delta(nft)) {
            IERC1155(nft).safeTransferFrom(from, to, tokenId, 1, "");
        } else {
            IERC721(nft).safeTransferFrom(from, to, tokenId);
        }
    }

    function isOwnerOf(address nft, address account, uint256 tokenId) internal view returns (bool) {
        if (isERC1155Delta(nft)) {
            return IERC1155Delta(nft).isOwnerOf(account, tokenId);
        } else {
            return IERC721(nft).ownerOf(tokenId) == account;
        }
    }

}


