
// SPDX-License-Identifier: MIT

import "./ERC1155DeltaMock.sol";

pragma solidity ^0.8.0;

contract ERC1155DeltaStartTokenIdMock is ERC1155DeltaMock {

    constructor(string memory uri_) ERC1155DeltaMock(uri_) {}

    function _startTokenId() internal override pure returns (uint256) {
        return 253;
    }

}