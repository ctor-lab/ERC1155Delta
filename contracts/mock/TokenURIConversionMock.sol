// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../wrapper/TokenURIConversion.sol";

contract TokenURIConversionMock {
    function convert(string memory uri_, uint256 tokenId) public pure returns (string memory tokenURI) {
        return TokenURIConversion.convert(uri_, tokenId);
    }
}
