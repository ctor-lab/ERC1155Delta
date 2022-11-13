// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC1155DeltaMock.sol";
import "../extensions/ERC1155DeltaQueryable.sol";

contract ERC1155DeltaQueryableMock is ERC1155DeltaMock, ERC1155DeltaQueryable {

    constructor(string memory uri_) ERC1155DeltaMock(uri_) {}

}