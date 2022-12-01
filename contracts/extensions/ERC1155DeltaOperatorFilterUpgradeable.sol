// SPDX-License-Identifier: MIT
// Creator: Ctor Lab (https://ctor.xyz)

pragma solidity ^0.8.0;

import "closedsea/src/OperatorFilterer.sol";

import "../ERC1155DeltaUpgradeable.sol";

abstract contract ERC1155DeltaOperatorFilter is ERC1155DeltaUpgradeable, OperatorFilterer {

    function __ERC1155DeltaOperatorFilter_init() internal onlyInitializing {
        __ERC1155DeltaOperatorFilter_init_unchained();
    }

    function __ERC1155DeltaOperatorFilter_init_unchained() internal onlyInitializing {
        _registerForOperatorFiltering();
    }


    function setApprovalForAll(address operator, bool approved)
        public
        override
        onlyAllowedOperatorApproval(operator)
    {
        super.setApprovalForAll(operator, approved);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        uint256 amount,
        bytes memory data
    ) public override onlyAllowedOperator(from) {
        super.safeTransferFrom(from, to, tokenId, amount, data);
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public virtual override onlyAllowedOperator(from) {
        super.safeBatchTransferFrom(from, to, ids, amounts, data);
    }

}