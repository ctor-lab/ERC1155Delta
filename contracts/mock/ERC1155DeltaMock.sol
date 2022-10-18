// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../ERC1155Delta.sol";

contract ERC1155DeltaMock is ERC1155Delta {

    constructor(string memory uri_) ERC1155Delta(uri_) {}

    function mint(
        address to,
        uint256 amount
    ) external {
        _mint(to, amount, "");    
    }

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

    function totalMinted() external view returns (uint256) {
        return _totalMinted();
    }

    function nextTokenId() external view returns (uint256) {
        return _nextTokenId();
    }

    function startTokenId() external pure returns (uint256) {
        return _startTokenId();
    }

}