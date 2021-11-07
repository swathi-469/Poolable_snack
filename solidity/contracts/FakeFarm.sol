// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

interface CakeTokenContract {
    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address recipient, uint256 amount)
        external
        returns (bool);
}

contract FakeFarm {
    CakeTokenContract cakeContract;

    uint256 fundsToWithdraw;

    constructor(address _cakeAddr) public {
        cakeContract = CakeTokenContract(_cakeAddr);
    }

    function stake(uint256 amount) external returns (uint256) {
        cakeContract.transfer(address(this), amount);
        fundsToWithdraw += amount;
        return amount;
        // cakeContract.transfer(msg.sender, uint256((6 * msg.amount) / 5));
    }

    function unstake() external returns (uint256) {
        uint256 res = fundsToWithdraw;
        cakeContract.transfer(msg.sender, fundsToWithdraw);
        fundsToWithdraw = 0;
        return res;
    }

    function getRewardsAvailable() public view returns (uint256) {
        return fundsToWithdraw;
    }
}
