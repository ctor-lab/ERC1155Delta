// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC1155DeltaMockUpgradeableWithInit.sol";
import "../extensions/ERC1155DeltaQueryableUpgradeable.sol";

contract ERC1155DeltaQueryableMockUpgradeableWithInit is ERC1155DeltaMockUpgradeableWithInit, ERC1155DeltaQueryableUpgradeable {

    constructor(string memory uri_) ERC1155DeltaMockUpgradeableWithInit(uri_) {}

}