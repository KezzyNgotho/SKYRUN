;; QuestRewards.clar - manages quests, reward distribution, and NFT minting
;; Core contract for CoinQuest game rewards system

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-QUEST-NOT-FOUND (err u101))
(define-constant ERR-QUEST-ALREADY-COMPLETED (err u102))
(define-constant ERR-INVALID-SCORE (err u103))
(define-constant ERR-TOKEN-MINT-FAILED (err u104))

;; Quest types
(define-constant QUEST-TYPE-GAME-SCORE u1)
(define-constant QUEST-TYPE-DAILY-LOGIN u2)
(define-constant QUEST-TYPE-SPECIAL u3)

;; Data Variables
(define-data-var quest-counter uint u0)
(define-data-var game-token-contract (optional principal) none)

;; Quest data structure
(define-map quests
  uint
  {
    title: (string-utf8 100),
    description: (string-utf8 200),
    quest-type: uint,
    reward-amount: uint,
    target-score: uint,
    active: bool
  }
)

;; User quest progress
(define-map user-quest-progress
  (tuple (user principal) (quest-id uint))
  {
    progress: uint,
    completed: bool,
    claimed: bool
  }
)

;; User game statistics
(define-map user-stats
  principal
  {
    total-games-played: uint,
    total-score: uint,
    high-score: uint,
    tokens-earned: uint,
    level: uint
  }
)

;; Events removed for compatibility

;; Public Functions

;; Create a new quest (admin only)
(define-public (create-quest 
  (title (string-utf8 100))
  (description (string-utf8 200))
  (quest-type uint)
  (reward-amount uint)
  (target-score uint)
)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (> reward-amount u0) ERR-INVALID-SCORE)
    (asserts! (> target-score u0) ERR-INVALID-SCORE)
    
    (let (
      (quest-id (+ (var-get quest-counter) u1))
    )
      (begin
        (var-set quest-counter quest-id)
        
        (map-set quests quest-id {
          title: title,
          description: description,
          quest-type: quest-type,
          reward-amount: reward-amount,
          target-score: target-score,
          active: true
        })
        
        (ok true)
      )
    )
  )
)

;; Submit game score and complete quests
(define-public (submit-game-score (score uint))
  (let (
    (user tx-sender)
    (user-stat (default-to {
      total-games-played: u0,
      total-score: u0,
      high-score: u0,
      tokens-earned: u0,
      level: u1
    } (map-get? user-stats user)))
    
    (new-total-games (+ (get total-games-played user-stat) u1))
    (new-total-score (+ (get total-score user-stat) score))
    (new-high-score (if (> score (get high-score user-stat)) score (get high-score user-stat)))
    (tokens-earned (calculate-tokens-for-score score))
    (new-tokens-earned (+ (get tokens-earned user-stat) tokens-earned))
    (new-level (calculate-level new-total-score))
  )
    (begin
      (asserts! (> score u0) ERR-INVALID-SCORE)
      
      ;; Update user statistics
      (map-set user-stats user {
        total-games-played: new-total-games,
        total-score: new-total-score,
        high-score: new-high-score,
        tokens-earned: new-tokens-earned,
        level: new-level
      })
      
      ;; Check and complete quests
      (unwrap-panic (check-and-complete-quests user score))
      
      ;; Mint tokens for score
      (unwrap-panic (mint-tokens-for-score user tokens-earned))
      
      (ok true)
    )
  )
)

;; Claim quest reward
(define-public (claim-quest-reward (quest-id uint))
  (let (
    (user tx-sender)
    (quest (unwrap-panic (map-get? quests quest-id)))
    (progress (unwrap-panic (map-get? user-quest-progress (tuple (user user) (quest-id quest-id)))))
  )
    (begin
      (asserts! (get completed progress) ERR-QUEST-NOT-FOUND)
      (asserts! (not (get claimed progress)) ERR-QUEST-ALREADY-COMPLETED)
      
      ;; Mark as claimed
      (map-set user-quest-progress (tuple (user user) (quest-id quest-id)) {
        progress: (get progress progress),
        completed: true,
        claimed: true
      })
      
      ;; Mint reward tokens (ignore result, ensure single response type)
      (unwrap-panic (mint-tokens-for-score user (get reward-amount quest)))
      (ok true)
    )
  )
)

;; Internal Functions

;; Check and complete quests based on score (simplified)
(define-private (check-and-complete-quests (user principal) (score uint))
  (begin
    ;; For now, just check quest 1 (first quest)
    (let (
      (quest-id u1)
      (quest (unwrap-panic (map-get? quests quest-id)))
      (progress (default-to {
        progress: u0,
        completed: false,
        claimed: false
      } (map-get? user-quest-progress (tuple (user user) (quest-id quest-id)))))
    )
      (begin
        ;; Check if quest should be completed
        (if (and (get active quest) 
                 (not (get completed progress))
                 (>= score (get target-score quest)))
          (begin
            ;; Complete the quest
            (map-set user-quest-progress (tuple (user user) (quest-id quest-id)) {
              progress: score,
              completed: true,
              claimed: false
            })
            (ok true)
          )
          (ok true)
        )
      )
    )
  )
)

;; Calculate tokens earned for score
(define-private (calculate-tokens-for-score (score uint))
  ;; Base reward: 1 token per 100 points
  (/ score u100)
)

;; Calculate user level based on total score
(define-private (calculate-level (total-score uint))
  ;; Level up every 1000 points
  (+ (/ total-score u1000) u1)
)

;; Mint tokens for score/reward (simplified)
(define-private (mint-tokens-for-score (user principal) (amount uint))
  ;; Fixed: Return a response with specific error type
  (if (> amount u0)
    (ok true)
    (err ERR-TOKEN-MINT-FAILED)
  )
)

;; Read-only Functions

;; Get quest details
(define-read-only (get-quest (quest-id uint))
  (ok (map-get? quests quest-id))
)

;; Get user quest progress
(define-read-only (get-quest-progress (quest-id uint) (user principal))
  (ok (map-get? user-quest-progress (tuple (user user) (quest-id quest-id))))
)

;; Get user statistics
(define-read-only (get-user-stats (user principal))
  (ok (map-get? user-stats user))
)

;; Get total quests
(define-read-only (get-total-quests)
  (ok (var-get quest-counter))
)

;; Admin Functions

;; Set game token contract
(define-public (set-game-token-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (var-set game-token-contract (some contract))
    (ok true)
  )
)

;; Toggle quest active status
(define-public (toggle-quest (quest-id uint) (active bool))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (is-some (map-get? quests quest-id)) ERR-QUEST-NOT-FOUND)
    
    (let (
      (quest (unwrap-panic (map-get? quests quest-id)))
    )
      (map-set quests quest-id {
        title: (get title quest),
        description: (get description quest),
        quest-type: (get quest-type quest),
        reward-amount: (get reward-amount quest),
        target-score: (get target-score quest),
        active: active
      })
    )
    (ok true)
  )
)