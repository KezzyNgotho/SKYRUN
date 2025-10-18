;; CoinQuestGame.clar - Main game contract with all functionality
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INSUFFICIENT_BALANCE (err u101))
(define-constant ERR_INVALID_SCORE (err u102))
(define-constant ERR_QUEST_NOT_FOUND (err u103))
(define-constant ERR_QUEST_ALREADY_COMPLETED (err u104))
(define-constant ERR_INSUFFICIENT_TOKENS (err u105))

;; Quest types
(define-constant QUEST_TYPE_SCORE u1)
(define-constant QUEST_TYPE_DAILY u2)
(define-constant QUEST_TYPE_SPECIAL u3)

;; Data Variables
(define-data-var quest_counter uint u0)
(define-data-var token_contract (optional principal) none)
(define-data-var lifeline_cost uint u10) ;; Cost 10 tokens for lifeline

;; Quest data structure
(define-map quests
  uint
  {
    title: (string-utf8 100),
    description: (string-utf8 200),
    quest_type: uint,
    reward_amount: uint,
    target_score: uint,
    active: bool
  }
)

;; User quest progress
(define-map user_quest_progress
  (tuple (user principal) (quest_id uint))
  {
    progress: uint,
    completed: bool,
    claimed: bool
  }
)

;; User game statistics
(define-map user_stats
  principal
  {
    total_games_played: uint,
    total_score: uint,
    high_score: uint,
    tokens_earned: uint,
    level: uint,
    lifelines_purchased: uint
  }
)

;; Public Functions

;; Submit game score and earn tokens
(define-public (submit_game_score (score uint))
  (let (
    (user tx-sender)
    (user_stat (default-to {
      total_games_played: u0,
      total_score: u0,
      high_score: u0,
      tokens_earned: u0,
      level: u1,
      lifelines_purchased: u0
    } (map-get? user_stats user)))
    
    (new_total_games (+ (get total_games_played user_stat) u1))
    (new_total_score (+ (get total_score user_stat) score))
    (new_high_score (if (> score (get high_score user_stat)) score (get high_score user_stat)))
    (tokens_earned (calculate_tokens_for_score score))
    (new_tokens_earned (+ (get tokens_earned user_stat) tokens_earned))
    (new_level (calculate_level new_total_score))
  )
    (begin
      (asserts! (> score u0) ERR_INVALID_SCORE)
      
      ;; Update user statistics
      (map-set user_stats user {
        total_games_played: new_total_games,
        total_score: new_total_score,
        high_score: new_high_score,
        tokens_earned: new_tokens_earned,
        level: new_level,
        lifelines_purchased: (get lifelines_purchased user_stat)
      })
      
      ;; Check and complete quests
      (unwrap-panic (check_and_complete_quests user score))
      
      ;; Mint tokens for score
      (unwrap-panic (mint_tokens_for_score user tokens_earned))
      
      (ok true)
    )
  )
)

;; Claim quest reward
(define-public (claim_quest_reward (quest_id uint))
  (let (
    (user tx-sender)
    (quest (unwrap-panic (map-get? quests quest_id)))
    (progress (unwrap-panic (map-get? user_quest_progress (tuple (user user) (quest_id quest_id)))))
  )
    (begin
      (asserts! (get completed progress) ERR_QUEST_NOT_FOUND)
      (asserts! (not (get claimed progress)) ERR_QUEST_ALREADY_COMPLETED)
      
      ;; Mark as claimed
      (map-set user_quest_progress (tuple (user user) (quest_id quest_id)) {
        progress: (get progress progress),
        completed: true,
        claimed: true
      })
      
      ;; Mint reward tokens
      (unwrap-panic (mint_tokens_for_score user (get reward_amount quest)))
      
      (ok true)
    )
  )
)

;; Buy lifeline (extra life in game)
(define-public (buy_lifeline)
  (let (
    (user tx-sender)
    (cost (var-get lifeline_cost))
    (user_stat (unwrap-panic (map-get? user_stats user)))
  )
    (begin
      ;; Check if user has enough tokens (simplified - in real implementation, check token balance)
      ;; For now, just update stats and emit event
      
      ;; Update user statistics
      (map-set user_stats user {
        total_games_played: (get total_games_played user_stat),
        total_score: (get total_score user_stat),
        high_score: (get high_score user_stat),
        tokens_earned: (get tokens_earned user_stat),
        level: (get level user_stat),
        lifelines_purchased: (+ (get lifelines_purchased user_stat) u1)
      })
      
      (ok true)
    )
  )
)

;; Internal Functions

;; Check and complete quests based on score
(define-private (check_and_complete_quests (user principal) (score uint))
  (begin
    ;; Check quest 1: Score 100 points
    (let (
      (quest_id u1)
      (quest (unwrap-panic (map-get? quests quest_id)))
      (progress (default-to {
        progress: u0,
        completed: false,
        claimed: false
      } (map-get? user_quest_progress (tuple (user user) (quest_id quest_id)))))
    )
      (begin
        ;; Check if quest should be completed
        (if (and (get active quest) 
                 (not (get completed progress))
                 (>= score (get target_score quest)))
          (begin
            ;; Complete the quest
            (map-set user_quest_progress (tuple (user user) (quest_id quest_id)) {
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
(define-private (calculate_tokens_for_score (score uint))
  ;; Base reward: 1 token per 100 points
  (/ score u100)
)

;; Calculate user level based on total score
(define-private (calculate_level (total_score uint))
  ;; Level up every 1000 points
  (+ (/ total_score u1000) u1)
)

;; Mint tokens for score/reward using token contract
(define-private (mint_tokens_for_score (user principal) (amount uint))
  ;; For now, just return success without calling token contract
  ;; This can be implemented later when contracts are deployed
  (if (> amount u0)
    (ok true)
    (err ERR_INSUFFICIENT_BALANCE)
  )
)

;; Read-only Functions

;; Get quest details
(define-read-only (get_quest (quest_id uint))
  (ok (map-get? quests quest_id))
)

;; Get user quest progress
(define-read-only (get_quest_progress (quest_id uint) (user principal))
  (ok (map-get? user_quest_progress (tuple (user user) (quest_id quest_id))))
)

;; Get user statistics
(define-read-only (get_user_stats (user principal))
  (ok (map-get? user_stats user))
)

;; Get total quests
(define-read-only (get_total_quests)
  (ok (var-get quest_counter))
)

;; Admin Functions

;; Create a new quest (admin only)
(define-public (create_quest
  (title (string-utf8 100))
  (description (string-utf8 200))
  (quest_type uint)
  (reward_amount uint)
  (target_score uint)
)
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (asserts! (> reward_amount u0) ERR_INVALID_SCORE)
    (asserts! (> target_score u0) ERR_INVALID_SCORE)
    
    (let (
      (quest_id (+ (var-get quest_counter) u1))
    )
      (begin
        (var-set quest_counter quest_id)
        
        (map-set quests quest_id {
          title: title,
          description: description,
          quest_type: quest_type,
          reward_amount: reward_amount,
          target_score: target_score,
          active: true
        })
        
        (ok true)
      )
    )
  )
)

;; Set token contract (admin only)
(define-public (set_token_contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (var-set token_contract (some contract))
    (ok true)
  )
)

;; Initialize default quests (admin only)
(define-public (initialize_default_quests)
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    
    ;; Create first quest: Score 100 points
    (unwrap-panic (create_quest 
      u"First Score" 
      u"Score your first 100 points in the game" 
      QUEST_TYPE_SCORE 
      u50 ;; Reward 50 tokens
      u100 ;; Target score 100
    ))
    
    (ok true)
  )
)

;; Initialize with token contract (admin only)
(define-public (initialize_with_game_token)
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    
    ;; Set the token contract address
    (var-set token_contract (some 'ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1.CoinQuestToken))
    
    ;; Initialize default quests
    (unwrap-panic (initialize_default_quests))
    
    (ok true)
  )
)

;; Set lifeline cost (admin only)
(define-public (set_lifeline_cost (cost uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (var-set lifeline_cost cost)
    (ok true)
  )
)
