// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../libs/token/ERC20/ERC20.sol";
import "../libs/token/ERC20/ERC20Detailed.sol";
import "../libs/math/SafeMath.sol";

/**
* @title SwitcheoToken - Standard ERC20 token
*
* @dev Implementation of the basic standard token.
* https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
*/
contract SwitcheoToken is ERC20, ERC20Detailed {
  using SafeMath for uint256;

  address public lockProxyAddress;

  constructor() ERC20Detailed("Switcheo Token", "SWTH", 8) public {}

  // TODO: remove me
  modifier isNotProd() {
    uint256 id;
    assembly {
        id := chainid()
    }
    require (id != 56 && id != 1, "SwitcheoToken: Minting On Production!");
    _;
  }

  function initalize(address _lockProxyAddress) public {
      require(lockProxyAddress == address(0), "SwitcheoToken: Already Initialized");
      lockProxyAddress = _lockProxyAddress;
  }

  function _transfer(address sender, address recipient, uint256 amount) internal override {
      if (msg.sender == lockProxyAddress) {
          require(recipient != lockProxyAddress, "SwitcheoToken: lockProxy should not call transfer to self");
          _mint(lockProxyAddress, amount); // lockProxy is the primary minter
      }

      super._transfer(sender, recipient, amount);

      if (recipient == lockProxyAddress) {
          _burn(lockProxyAddress, amount); // auto-burn to maintain total supply
      }
  }

  // TODO: remove me
  function mint(uint256 amount) external isNotProd returns (bool) {
      _mint(msg.sender, amount);
      return true;
  }

  // TODO: remove me
  function burn(uint256 amount) external isNotProd returns (bool) {
      _burn(msg.sender, amount);
      return true;
  }
}