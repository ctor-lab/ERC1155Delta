
// SPDX-License-Identifier: MIT

import "./ERC1155DeltaQueryableMockUpgradeableWithInit.sol";

pragma solidity ^0.8.0;

contract ERC1155DeltaQueryableStartTokenIdMockUpgradeableWithInit is ERC1155DeltaQueryableMockUpgradeableWithInit {

    constructor(string memory uri_) ERC1155DeltaQueryableMockUpgradeableWithInit(uri_) {}

    function _startTokenId() internal override pure returns (uint256) {
        return 253;
    }

}