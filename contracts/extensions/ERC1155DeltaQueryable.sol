// SPDX-License-Identifier: MIT
// Creator: Ctor Lab (https://ctor.xyz)

pragma solidity ^0.8.0;

import "solidity-bits/contracts/BitMaps.sol";

import "../ERC1155Delta.sol";

import "./IERC1155DeltaQueryable.sol";

abstract contract ERC1155DeltaQueryable is IERC1155DeltaQueryable, ERC1155Delta {
    using BitMaps for BitMaps.BitMap;

    error InvalidQueryRange();


    /**
     * @dev Returns the number of tokens owned by `owner`.
     */
    function balanceOf(address owner) public view virtual override returns (uint256) {
        return balanceOf(owner, _startTokenId(), _nextTokenId());
    }


/**
     * @dev Returns the number of tokens owned by `owner`,
     * in the range [`start`, `stop`)
     * (i.e. `start <= tokenId < stop`).
     *
     * Requirements:
     *
     * - `start < stop`
     */
    function balanceOf(address owner, uint256 start, uint256 stop) public view virtual override returns (uint256) {
        return _owned[owner].popcountB(start, stop - start);
    }


    /**
     * @dev Returns an array of token IDs owned by `owner`,
     * in the range [`start`, `stop`)
     * (i.e. `start <= tokenId < stop`).
     *
     * This function allows for tokens to be queried if the collection
     * grows too big for a single call of {ERC1155DelataQueryable-tokensOfOwner}.
     *
     * Requirements:
     *
     * - `start < stop`
     */
    function tokensOfOwnerIn(
        address owner,
        uint256 start,
        uint256 stop
    ) public view virtual override returns (uint256[] memory) {
        unchecked {
            if (start >= stop) revert InvalidQueryRange();
            uint256 tokenIdsIdx;
            uint256 stopLimit = _nextTokenId();
            // Set `start = max(start, _startTokenId())`.
            if (start < _startTokenId()) {
                start = _startTokenId();
            }
            // Set `stop = min(stop, stopLimit)`.
            if (stop > stopLimit) {
                stop = stopLimit;
            }
            uint256 tokenIdsLength = balanceOf(owner, start, stop);
            uint256[] memory tokenIds = new uint256[](tokenIdsLength);

            BitMaps.BitMap storage bmap = _owned[owner];

            for (uint256 i = _startTokenId(); tokenIdsIdx != tokenIdsLength; ++i) {
                if(bmap.get(i) ) {
                    tokenIds[tokenIdsIdx++] = i;
                }
            }
            return tokenIds;
        }
    }

    /**
     * @dev Returns an array of token IDs owned by `owner`.
     *
     * This function scans the ownership mapping and is O(`totalSupply`) in complexity.
     * It is meant to be called off-chain.
     *
     * See {ERC1155DeltaQueryable-tokensOfOwnerIn} for splitting the scan into
     * multiple smaller scans if the collection is large enough to cause
     * an out-of-gas error (10K collections should be fine).
     */
    function tokensOfOwner(address owner) public view virtual override returns (uint256[] memory) {
        return tokensOfOwnerIn(owner, _startTokenId(), _nextTokenId());
    }
}