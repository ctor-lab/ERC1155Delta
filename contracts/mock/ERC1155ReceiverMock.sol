// SPDX-License-Identifier: MIT
// Creator: Ctor Lab (https://ctor.xyz)
// Modified from ERC721A (https://github.com/chiru-labs/ERC721A/blob/main/contracts/mocks/ERC721ReceiverMock.sol)

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "./ERC1155DeltaMock.sol";




interface IERC721AMock {
    function safeMint(address to, uint256 quantity) external;
}

contract ERC1155ReceiverMock is ERC1155Receiver {
    enum Error {
        None,
        RevertWithMessage,
        RevertWithoutMessage,
        Panic
    }

    bytes4 private immutable _retval;
    bytes4 private immutable _retvalBatch;
    address private immutable _erc1155deltaMock;

    event Received(address operator, address from, uint256 id, bytes data, uint256 gas);
    event ReceivedBatch(address operator, address from, uint256[] ids, bytes data, uint256 gas);

    constructor(bytes4 retval, bytes4 retvalBatch, address erc721aMock) {
        _retval = retval;
        _retvalBatch = retvalBatch;
        _erc1155deltaMock = erc721aMock;
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 /*value*/,
        bytes calldata data
    ) public virtual override returns (bytes4) {
        uint256 dataValue = data.length == 0 ? 0 : uint256(uint8(data[0]));

        // For testing reverts with a message from the receiver contract.
        if (dataValue == 0x01) {
            revert('reverted in the receiver contract!');
        }

        // For testing with the returned wrong value from the receiver contract.
        if (dataValue == 0x02) {
            return 0x0;
        }

        // For testing the reentrancy protection.
        if (dataValue == 0x03) {
            ERC1155DeltaMock(_erc1155deltaMock).mint(address(this), 1, "");
        }

        emit Received(operator, from, id, data, 20000);
        return _retval;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata /*values*/,
        bytes calldata data
    ) public virtual override returns (bytes4) {
        uint256 dataValue = data.length == 0 ? 0 : uint256(uint8(data[0]));

        // For testing reverts with a message from the receiver contract.
        if (dataValue == 0x01) {
            revert('reverted in the receiver contract!');
        }

        // For testing with the returned wrong value from the receiver contract.
        if (dataValue == 0x02) {
            return 0x0;
        }

        // For testing the reentrancy protection.
        if (dataValue == 0x03) {
            ERC1155DeltaMock(_erc1155deltaMock).mint(address(this), 1, "");
        }
        emit ReceivedBatch(operator, from, ids, data, 20000);
        return _retvalBatch;
    }
}