// SPDX-License-Identifier: MIT
// Creator: Ctor Lab (https://ctor.xyz)

import "erc721psi/contracts/benchmark/ERC721AMock.sol";
import "erc721psi/contracts/mock/ERC721PsiMock.sol";
import "erc721psi/contracts/mock/ERC721PsiBurnableMock.sol";


contract ERC721AAirdrop is ERC721AMock{
    constructor(
        string memory name,
        string memory symbol
    ) ERC721AMock(name, symbol){

    }

    function airdrop(address[] calldata tos) public {
        unchecked {
            for(uint256 i=0; i<tos.length; i++) {
                _mint(tos[i], 1);
            }
        }
    }
}

contract ERC721PsiAirdrop is ERC721PsiMock{
    constructor(
        string memory name,
        string memory symbol
    ) ERC721PsiMock(name, symbol){

    }

    function airdrop(address[] calldata tos) public {
        unchecked {
            for(uint256 i=0; i<tos.length; i++) {
                _mint(tos[i], 1);
            }
        }
    }
}