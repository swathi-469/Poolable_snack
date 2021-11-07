pragma solidity >=0.4.22 <0.8.0;

interface PancakeRouter {
    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);

    function swapExactTokensForETH(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);
}

interface CakeToken {
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

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);
}

interface FakeFarmContract {
    function stake(uint256 amount) external returns (uint256);

    function unstake() external returns (uint256);
}

contract Pool {
    uint256 totalAmt;
    // address counterAddr;
    address WBNBAddr;
    address cakeAddr;
    PancakeRouter swapper;
    CakeToken cakeContract;
    FakeFarmContract fakeFarm;
    uint256 baseYield;

    address public owner;

    mapping(address => uint256) public stakingAmts;
    uint256 numPpl;
    uint256 randNonce;
    address[] names;


    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        // Underscore is a special character only used inside
        // a function modifier and it tells Solidity to
        // execute the rest of the code.
        _;
    }

    constructor(
        address _routerAddr,
        address _cakeTokenAddr,
        address _fakeFarmAddr
    ) public {
        owner = msg.sender;
        swapper = PancakeRouter(_routerAddr);
        // cakeContract = CakeToken(0xf9f93cf501bfadb6494589cb4b4c15de49e85d0e);
        cakeContract = CakeToken(_cakeTokenAddr);
        fakeFarm = FakeFarmContract(_fakeFarmAddr);
        WBNBAddr = 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd;
        cakeAddr = 0xF9f93cF501BFaDB6494589Cb4b4C15dE49E85D0e;
        numPpl = 0;
        baseYield = 5; //percent
    }

    function setSwapper(address _contract) public {
        swapper = PancakeRouter(_contract);
    }

    function deposit() public payable {
        address[] memory path = new address[](2);
        path[0] = WBNBAddr;
        path[1] = cakeAddr;
        uint256[] memory amts = swapper.swapExactETHForTokens{value: msg.value}(
            0,
            path,
            address(this),
            1667183841
        );

        //increase user's amt by x cake units

        // if(stakingAmts[msg.sender] == null){

        // } else{
        if(stakingAmts[msg.sender] == 0){
            names[numPpl] = msg.sender;
            numPpl++;
        }
        stakingAmts[msg.sender] += amts[0];
        
        totalAmt += amts[0];
        // cakeContract.transfer(recipient, amount);
        // cakeContract.transfer(recipient, amount);
        _stake();
    }

    function random(uint256 max) private returns (uint256) {
        randNonce++; 
        return uint256(keccak256(abi.encodePacked(now,
                                                msg.sender,
                                                randNonce))) % max;
        // return uint8(uint256(keccak256(abi.encodePacked(_text, _num, _addr))%max);
    }

    function lottery() public onlyOwner {

        uint256 newTotal = cakeContract.balanceOf(address(this));
        uint32 factor = 1000;
        uint256[] memory slots = new uint256[](numPpl);
        uint256 totSlots = 0;
        //[1, 5, 4] 
        for(uint256 i = 0; i<numPpl; i++){
            uint256 contribution = stakingAmts[names[i]];
            uint256 numSlots = (contribution / totalAmt) * factor;
            slots[i] = numSlots;
            totSlots += numSlots;
        }

        uint256 numWinners = (numPpl > 100) ? 10 : 1;
        uint256 winAmt = (newTotal - totalAmt) / numWinners;
        for(uint8 i = 0; i<numWinners; i++){
            uint256 winner = random(totSlots + 1);
            //0.1 * 
            for(uint256 j=0; j < numPpl; j++){
                if(slots[j] < winner) winner -= slots[j];
                //have found j as winner
                stakingAmts[names[j]] += winAmt;
            }
        }
    }

    function _stake() private returns (uint256) {
        uint256 staked = fakeFarm.stake(cakeContract.balanceOf(address(this)));
        return staked;
    }

    function distribute() public returns (uint256) {
        uint256 unstaked = fakeFarm.unstake();
        // do lottery, pick wallets of participants proportional to deposit
        
        // disperse all profits (make sure to track initial deposits) to window
        // for each winner blah blah blah
        return unstaked;
    }

    function test() public pure returns (string memory) {
        return "poo";
    }
}
