// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ISkyRunToken {
    function mint(address to, uint256 amount) external;
}

contract SkyRunGame {
    struct Quest {
        string title;
        string description;
        uint8 questType; // 1: score, 2: daily, 3: special
        uint256 rewardAmount;
        uint256 targetScore;
        bool active;
    }

    struct Progress {
        uint256 progress;
        bool completed;
        bool claimed;
    }

    struct Stats {
        uint256 totalGamesPlayed;
        uint256 totalScore;
        uint256 highScore;
        uint256 tokensEarned;
        uint256 level;
        uint256 lifelinesPurchased;
    }

    address public owner;
    ISkyRunToken public token;
    uint256 public lifelineCost = 10 ether;

    uint256 public questCounter;
    mapping(uint256 => Quest) public quests;
    mapping(address => mapping(uint256 => Progress)) public userQuestProgress;
    mapping(address => Stats) public userStats;

    error NotAuthorized();
    error InvalidScore();
    error QuestNotFound();
    error QuestAlreadyClaimed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotAuthorized();
        _;
    }

    constructor(address tokenAddress) {
        owner = msg.sender;
        token = ISkyRunToken(tokenAddress);
    }

    function submitGameScore(uint256 score) external {
        if (score == 0) revert InvalidScore();

        Stats storage s = userStats[msg.sender];
        s.totalGamesPlayed += 1;
        s.totalScore += score;
        if (score > s.highScore) s.highScore = score;
        uint256 tokensToMint = _calculateTokensForScore(score);
        s.tokensEarned += tokensToMint;
        s.level = _calculateLevel(s.totalScore);

        _checkAndCompleteQuests(msg.sender, score);

        if (tokensToMint > 0) {
            token.mint(msg.sender, tokensToMint);
        }
    }

    function claimQuestReward(uint256 questId) external {
        Quest storage q = quests[questId];
        if (!q.active) revert QuestNotFound();

        Progress storage p = userQuestProgress[msg.sender][questId];
        if (!p.completed) revert QuestNotFound();
        if (p.claimed) revert QuestAlreadyClaimed();

        p.claimed = true;
        if (q.rewardAmount > 0) {
            token.mint(msg.sender, q.rewardAmount);
        }
    }

    function buyLifeline() external {
        Stats storage s = userStats[msg.sender];
        s.lifelinesPurchased += 1;
    }

    function getQuest(uint256 questId) external view returns (Quest memory) {
        return quests[questId];
    }

    function getQuestProgress(uint256 questId, address user) external view returns (Progress memory) {
        return userQuestProgress[user][questId];
    }

    function getUserStats(address user) external view returns (Stats memory) {
        return userStats[user];
    }

    function getTotalQuests() external view returns (uint256) {
        return questCounter;
    }

    function createQuest(
        string memory title,
        string memory description,
        uint8 questType,
        uint256 rewardAmount,
        uint256 targetScore
    ) external onlyOwner {
        if (rewardAmount == 0 || targetScore == 0) revert InvalidScore();
        questCounter += 1;
        quests[questCounter] = Quest({
            title: title,
            description: description,
            questType: questType,
            rewardAmount: rewardAmount,
            targetScore: targetScore,
            active: true
        });
    }

    function setLifelineCost(uint256 cost) external onlyOwner {
        lifelineCost = cost;
    }

    function _checkAndCompleteQuests(address user, uint256 score) internal {
        for (uint256 i = 1; i <= questCounter; i++) {
            Quest storage q = quests[i];
            if (!q.active) continue;
            Progress storage p = userQuestProgress[user][i];
            if (!p.completed && score >= q.targetScore) {
                p.progress = score;
                p.completed = true;
            }
        }
    }

    function _calculateTokensForScore(uint256 score) internal pure returns (uint256) {
        return score / 100;
    }

    function _calculateLevel(uint256 totalScore) internal pure returns (uint256) {
        return (totalScore / 1000) + 1;
    }
}


