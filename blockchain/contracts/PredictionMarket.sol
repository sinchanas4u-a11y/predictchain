// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PredictionMarket {
    struct PredictionEvent {
        uint256 id;
        string title;
        string description;
        uint256 endTime;
        bool resolved;
        bool result; // true = YES, false = NO
        uint256 totalYesPool;
        uint256 totalNoPool;
    }

    struct UserStake {
        uint256 yesStake;
        uint256 noStake;
        bool claimed;
    }

    uint256 public nextEventId;
    address public owner;

    mapping(uint256 => PredictionEvent) public events;
    mapping(uint256 => mapping(address => UserStake)) public userStakes;

    event EventCreated(uint256 indexed eventId, string title, uint256 endTime);
    event StakePlaced(uint256 indexed eventId, address indexed user, bool isYes, uint256 amount);
    event EventResolved(uint256 indexed eventId, bool result);
    event RewardClaimed(uint256 indexed eventId, address indexed user, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createPrediction(string memory _title, string memory _desc, uint256 _endTime) external {
        require(_endTime > block.timestamp, "End time must be in future");
        uint256 eventId = nextEventId++;

        events[eventId] = PredictionEvent({
            id: eventId,
            title: _title,
            description: _desc,
            endTime: _endTime,
            resolved: false,
            result: false,
            totalYesPool: 0,
            totalNoPool: 0
        });

        emit EventCreated(eventId, _title, _endTime);
    }

    function placePrediction(uint256 _eventId, bool _isYes) external payable {
        PredictionEvent storage pEvent = events[_eventId];
        require(_eventId < nextEventId, "Event does not exist");
        require(block.timestamp < pEvent.endTime, "Event has ended");
        require(!pEvent.resolved, "Event already resolved");
        require(msg.value > 0, "Stake must be > 0");

        if (_isYes) {
            pEvent.totalYesPool += msg.value;
            userStakes[_eventId][msg.sender].yesStake += msg.value;
        } else {
            pEvent.totalNoPool += msg.value;
            userStakes[_eventId][msg.sender].noStake += msg.value;
        }

        emit StakePlaced(_eventId, msg.sender, _isYes, msg.value);
    }

    function resolvePrediction(uint256 _eventId, bool _result) external onlyOwner {
        PredictionEvent storage pEvent = events[_eventId];
        require(_eventId < nextEventId, "Event does not exist");
        require(block.timestamp >= pEvent.endTime, "Event has not ended yet");
        require(!pEvent.resolved, "Event already resolved");

        pEvent.resolved = true;
        pEvent.result = _result;

        emit EventResolved(_eventId, _result);
    }

    function claimReward(uint256 _eventId) external {
        PredictionEvent storage pEvent = events[_eventId];
        require(pEvent.resolved, "Event not resolved yet");
        
        UserStake storage userStake = userStakes[_eventId][msg.sender];
        require(!userStake.claimed, "Reward already claimed");

        uint256 totalWinningPool;
        uint256 totalLosingPool;
        uint256 userWinningStake;

        if (pEvent.result) { // YES won
            totalWinningPool = pEvent.totalYesPool;
            totalLosingPool = pEvent.totalNoPool;
            userWinningStake = userStake.yesStake;
        } else { // NO won
            totalWinningPool = pEvent.totalNoPool;
            totalLosingPool = pEvent.totalYesPool;
            userWinningStake = userStake.noStake;
        }

        require(userWinningStake > 0, "No winning stake");

        userStake.claimed = true;
        
        // Reward mapping (user proportion of total pool)
        uint256 totalPool = totalWinningPool + totalLosingPool;
        uint256 rewardAmount = (userWinningStake * totalPool) / totalWinningPool;

        (bool success, ) = payable(msg.sender).call{value: rewardAmount}("");
        require(success, "Transfer failed");

        emit RewardClaimed(_eventId, msg.sender, rewardAmount);
    }

    /// @notice Helper to fetch paginated events
    function getEvents(uint256 _cursor, uint256 _count) external view returns (PredictionEvent[] memory) {
        uint256 length = nextEventId;
        if (_cursor >= length) {
            return new PredictionEvent[](0);
        }
        uint256 returnedCount = _count;
        if (_cursor + returnedCount > length) {
            returnedCount = length - _cursor;
        }
        PredictionEvent[] memory resultEvents = new PredictionEvent[](returnedCount);
        for (uint256 i = 0; i < returnedCount; i++) {
            resultEvents[i] = events[_cursor + i];
        }
        return resultEvents;
    }
}
