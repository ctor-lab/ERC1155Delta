// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../ERC1155DeltaUpgradeable.sol";

contract ERC1155DeltaMockUpgradeableWithInit is ERC1155DeltaUpgradeable {

    function mint(
        address to,
        uint256 amount,
        bytes calldata data
    ) external {
        _mint(to, amount, data);
    }

    function setURI(string memory newuri) public {
        _setURI(newuri);

    }

    function burn(
        address from,
        uint256 id
    ) public {
        _burn(from, id);
    }

}