
// SPDX-License-Identifier: MIT

import "./ERC1155DeltaQueryableMock.sol";

pragma solidity ^0.8.0;

contract ERC1155DeltaQueryableStartTokenIdMock is ERC1155DeltaQueryableMock {

    constructor(string memory uri_) ERC1155DeltaQueryableMock(uri_) {}

    function _startTokenId() internal override pure returns (uint256) {
        return 253;
    }

}