pragma solidity ^0.4.15;

contract DronsContract {
  address public owner;

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  mapping (address => bool) public drons;
  mapping (address => bool) public tokenHolders;  

  struct Order {
    address recipientAddress;
    uint finishingBlockNumber;
    uint status;
  }
  uint128[] public ordersIds;
  mapping (uint128 => bool) public ordersIdsUsed;
  mapping (uint128 => Order) public orders;

  function DronsContract() public {
    owner = msg.sender;
  }

  function addDron(address a) public onlyOwner {
    drons[a] = true;
  }

  function addTokenHolder(address a) public onlyOwner {
    tokenHolders[a] = true;
  }

  function addOrder(uint128 id, address a) public {
    require(tokenHolders[msg.sender]);
    require(!ordersIdsUsed[id]);
    var order = orders[id];
    order.recipientAddress = a;  
    ordersIdsUsed[id] = true;      
    ordersIds.push(id);
  }

  function getOrdersIds() view public returns (uint128[]) {
    return ordersIds;
  }

  function getOrder(uint128 id) view public returns (address, uint, uint) {
    return (orders[id].recipientAddress, orders[id].finishingBlockNumber, orders[id].status);
  }

  event OrderFinished(
    uint128, address,
    uint24,
    bytes32, bytes32, uint,
    bytes32, bytes32, uint,
    bytes32, bytes32, uint, uint
  );

  function finishOrder(
    uint128 id, address dronAddress,
    uint24 _v123, 
    bytes32 _r1, bytes32 _s1, uint timestamp1,
    bytes32 _r2, bytes32 _s2, uint timestamp2,
    bytes32 _r3, bytes32 _s3, uint timestamp3, uint status
  ) public onlyOwner
  { 
    require(drons[dronAddress]);
    require(ordersIdsUsed[id]);
    require(orders[id].status == 0);
    require(status != 0);
    require(dronAddress == ecrecover(keccak256(id, timestamp1), uint8(_v123 & 0xFF), _r1, _s1));
    require(dronAddress == ecrecover(keccak256(id, timestamp2), uint8((_v123 >> 8) & 0xFF), _r2, _s2));
    require(orders[id].recipientAddress == ecrecover(keccak256(id, timestamp3, status), uint8(_v123 >> 16), _r3, _s3));

    orders[id].finishingBlockNumber = block.number;
    orders[id].status = status;

    OrderFinished(
      id, dronAddress,
      _v123,
      _r1, _s1, timestamp1,
      _r2, _s2, timestamp2,
      _r3, _s3, timestamp3, status
    );
  }
}