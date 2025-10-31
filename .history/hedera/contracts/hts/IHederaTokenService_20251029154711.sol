// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

interface IHederaTokenService {
    // Fungible mint; returns newTotalSupply and serialNumbers (empty for fungible)
    function mintToken(address token, int64 amount, bytes[] calldata metadata)
        external returns (int32 responseCode, int64 newTotalSupply, int64[] memory serialNumbers);

    // Bulk transfer using signed amounts; e.g. [from, to], [-amount, +amount]
    function transferTokens(address token, address[] calldata accountIds, int64[] calldata amounts)
        external returns (int32 responseCode);
}


