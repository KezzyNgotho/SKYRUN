// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IHederaTokenService} from "./hts/IHederaTokenService.sol";
import {HederaResponseCodes} from "./hts/HederaResponseCodes.sol";

interface ISkyRunToken { function mint(address to, uint256 amount) external; }

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
        uint256 availableLives; // Lives that can be used in game
    }

    address public owner;
    ISkyRunToken public token; // ERC-20 path (optional)
    address public htsToken;    // HTS token address (optional)
    bool public useHTS;         // when true, use HTS precompile for rewards
    uint256 public lifelineCost = 10; // Cost in simple token units (not wei)

    uint256 public questCounter;
    mapping(uint256 => Quest) public quests;
    mapping(address => mapping(uint256 => Progress)) public userQuestProgress;
    mapping(address => Stats) public userStats;

    error NotAuthorized();
    error InvalidScore();
    error QuestNotFound();
    error QuestAlreadyClaimed();
    error InsufficientTokenBalance();
    error NoLivesAvailable();

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
            _rewardTokens(msg.sender, tokensToMint);
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
            _rewardTokens(msg.sender, q.rewardAmount);
        }
    }

    function buyLifeline() external {
        Stats storage s = userStats[msg.sender];
        
        // Check if user has enough tokens
        // Note: In a real implementation, you'd query the actual token balance
        // For now, we track earned vs purchased lifelines
        uint256 tokensSpent = s.lifelinesPurchased * lifelineCost;
        if (s.tokensEarned < tokensSpent + lifelineCost) {
            revert InsufficientTokenBalance();
        }
        
        // Purchase the lifeline
        s.lifelinesPurchased += 1;
        s.availableLives += 1; // Grant 1 life
        
        // Optional: Burn tokens if using HTS or ERC-20
        // For now, we just track the virtual balance
    }
    
    function useLifeline() external {
        Stats storage s = userStats[msg.sender];
        if (s.availableLives == 0) revert NoLivesAvailable();
        s.availableLives -= 1;
    }
    
    function getAvailableLives(address user) external view returns (uint256) {
        return userStats[user].availableLives;
    }
    
    function getTokenBalance(address user) external view returns (uint256) {
        Stats storage s = userStats[user];
        uint256 tokensSpent = s.lifelinesPurchased * lifelineCost;
        if (s.tokensEarned < tokensSpent) return 0;
        return s.tokensEarned - tokensSpent;
    }

    function getQuest(uint256 questId) external view returns (Quest memory) {
        return quests[questId];
    }

    function getQuestProgress(uint256 questId, address user) external view returns (Progress memory) {
        return userQuestProgress[user][questId];
    }

    function getUserStats() external view returns (Stats memory) {
        return userStats[msg.sender];
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

    // Enable HTS reward mode; assumes this contract is the token's treasury and has supplyKey
    function setHTSToken(address tokenAddress, bool enabled) external onlyOwner {
        htsToken = tokenAddress;
        useHTS = enabled;
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

    function _rewardTokens(address to, uint256 amount) internal {
        if (useHTS && htsToken != address(0)) {
            _rewardViaHTS(to, amount);
        } else if (address(token) != address(0)) {
            token.mint(to, amount);
        }
    }

    function _rewardViaHTS(address to, uint256 amount) internal {
        // Requirements:
        // - This contract must be the token treasury (so mint credits this contract)
        // - This contract must hold the token supply key (as contract key) to mint
        // - The recipient must be associated with the token (auto-association or explicit)
        int64 amt = _toInt64(amount);
        // 1) Mint to treasury (this contract)
        (int32 rc,,) = IHederaTokenService(0x0000000000000000000000000000000000000167)
            .mintToken(htsToken, amt, new bytes[](0));
        require(rc == HederaResponseCodes.SUCCESS, "HTS mint failed");

        // 2) Transfer from treasury (this) to recipient using signed batch
        address[] memory accounts = new address[](2);
        accounts[0] = address(this);
        accounts[1] = to;
        int64[] memory amounts = new int64[](2);
        amounts[0] = -amt;
        amounts[1] = amt;
        int32 rc2 = IHederaTokenService(0x0000000000000000000000000000000000000167)
            .transferTokens(htsToken, accounts, amounts);
        require(rc2 == HederaResponseCodes.SUCCESS, "HTS transfer failed");
    }

    function _toInt64(uint256 v) private pure returns (int64) {
        require(v <= uint64(type(int64).max), "amount too large");
        return int64(int256(v));
    }
}


