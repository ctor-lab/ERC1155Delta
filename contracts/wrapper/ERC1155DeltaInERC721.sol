// SPDX-License-Identifier: MIT
// Creator: Ctor Lab (https://ctor.xyz)

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "../IERC1155Delta.sol";

interface IOwnable {
    function owner() external view returns (address);
}


contract ERC1155DeltaInERC721 is IOwnable, ERC1155Receiver, ERC721 {
    address public immutable erc115delta;

    constructor(
        address erc115delta_,
        string memory name_,
        string memory symbol_
    ) ERC721(name_, symbol_) {
        erc115delta = erc115delta_;
    }

    // TODO override tokenURI

    function owner() external virtual override view returns (address) {
        return IOwnable(erc115delta).owner();
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155Receiver, ERC721) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function unwrap(uint256[] calldata tokenIds) public virtual {
        for(uint256 i; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(
                _isApprovedOrOwner(msg.sender, tokenId),
                "ERC1155DeltaInERC721: msg.sender not the token owner or an approved operator"
            );
            address tokenOwner = ownerOf(tokenId);
            _burn(tokenId);
            // TODO think about the reentrancy problem.
            IERC1155Delta(erc115delta).safeTransferFrom(address(this), tokenOwner, tokenId, 1, "");
        }
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) public virtual override returns (bytes4) {
        require(msg.sender == erc115delta, "ERC1155DeltaInERC721: Not from the ERC1155Delta contract");
        _safeMint(from, id);
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) public virtual override returns (bytes4) {
        require(msg.sender == erc115delta, "ERC1155DeltaInERC721: Not from the ERC1155Delta contract");
        unchecked {
            for(uint256 i; i < ids.length; i++) {
                _safeMint(from, ids[i]);
            }
        }
        return this.onERC1155BatchReceived.selector;
    }

}