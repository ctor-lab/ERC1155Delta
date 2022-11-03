
// SPDX-License-Identifier: MIT

import "./ERC1155DeltaMockUpgradeableWithInit.sol";

pragma solidity ^0.8.0;

contract ERC1155DeltaStartTokenIdMockUpgradeableWithInit is ERC1155DeltaMockUpgradeableWithInit {

    constructor(string memory uri_) ERC1155DeltaMockUpgradeableWithInit(uri_) {}

    function _startTokenId() internal override pure returns (uint256) {
        return 253;
    }

}