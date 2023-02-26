# ERC1155Delta
[![Test](https://github.com/estarriolvetch/ERC1155Delta/actions/workflows/test.yml/badge.svg)](https://github.com/estarriolvetch/ERC1155Delta/actions/workflows/test.yml)
[![Publish Package to npmjs](https://github.com/ctor-lab/ERC1155Delta/actions/workflows/deploy_npm.yml/badge.svg)](https://github.com/ctor-lab/ERC1155Delta/actions/workflows/deploy_npm.yml)
[![npm](https://img.shields.io/npm/v/erc1155delta)](https://www.npmjs.com/package/erc1155delta)

 ERC1155Delta is an NFT implementation/standard that is highly optimized for gas comsumption and has less impact on the blockchain storage space. ERC1155Delta is meant to be an drop-in replacement for ERC721. Like ERC721, each ERC1155Delta token is unique. 

- Website: https://erc1155delta.ctor.xyz/
- Litepaper: https://mirror.xyz/ctor.xyz/pW1DxSNdaabCyHwVSfDrnlj5LLRzsA8TEfkmR-HP5PE

![](https://mirror.xyz/_next/image?url=https%3A%2F%2Fimages.mirror-media.xyz%2Fpublication-images%2FEHujxay_jCt2FCClLW1rY.png&w=640&q=90)

## Installaion
### npm
```
npm install erc1155delta
```
### yarn
```
yarn add erc1155delta
```


## Usage
```solidity
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "erc1155delta/contracts/ERC1155Delta.sol";

contract ElyiumSystem is ERC1155Delta {

    constructor() ERC1155Delta("https://token-cdn-domain/{id}.json") {}

    function mint(
        address to,
        uint256 amount
    ) external {
        _mint(to, amount);    
    }
}
```

## Acknoledgement
This repository is inspired by or directly modified from the following projects:
- Openzeppelin SDK
- ERC721A


