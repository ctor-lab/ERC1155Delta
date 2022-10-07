// SPDX-License-Identifier: MIT
// Creator: Ctor Lab (https://ctor.xyz)
import "@openzeppelin/contracts/utils/Strings.sol";

pragma solidity ^0.8.0;

library TokenURIConversion {
    function convert(string memory uri_, uint256 tokenId) internal pure returns (string memory tokenURI) {

        bytes memory uri = bytes(uri_);

        bool replace = false;
        uint256 replace_index;
        unchecked {
            for(uint256 i=0;i<bytes(uri).length - 3; i++) {
                if(uri[i] == "{") {
                    if(
                        uri[i+1] == "i" &&
                        uri[i+2] == "d" &&
                        uri[i+3] == "}"
                    ) {
                        replace_index = i;
                        replace = true;
                        break;
                    }
                }
            }
        }
        
        
        if(replace) {
            uint256 newUriLength = bytes(uri).length + 60;
            bytes memory newUri = new bytes(newUriLength);
            bytes memory id = bytes(Strings.toHexString(tokenId, 32));
            unchecked {
                for(uint256 i; i < newUriLength; i++) {
                    if (i < replace_index) {
                        newUri[i] = uri[i];
                    } else if (i < replace_index + 64) {
                        newUri[i] = id[i - replace_index + 2];
                    } else {
                        newUri[i] = uri[i-60];
                    }
                }
            }
            return string(newUri);
        } else {
            return string(uri);
        }
    }
}