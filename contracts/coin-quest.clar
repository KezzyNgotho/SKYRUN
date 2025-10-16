;; coinQuest - Stacks Clarity Smart Contract
;; A play-to-earn gaming contract for the Stacks Vibe Coding Hackathon

(impl-trait .coin-quest-trait.coin-quest-trait)

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INSUFFICIENT-BALANCE (err u101))
(define-constant ERR-INVALID-SCORE (err u102))
(define-constant ERR-GAME-NOT-STARTED (err u103))

;; Data Variables
(define-data-var total-supply uint u1000000000000) ; 1M tokens with 6 decimals
(define-data-var game-active bool true)
(define-data-var reward-rate uint u100) ; Base reward rate per score point

;; User balances
(define-map balances principal uint)

;; User game data
(define-map user-scores principal uint)
(define-map user-levels principal uint)
(define-map user-total-earned principal uint)
(define-map user-games-played principal uint)

;; Events
(define-event (game-completed (player principal) (score uint) (reward uint)))
(define-event (reward-claimed (player principal) (amount uint)))
(define-event (level-up (player principal) (new-level uint)))

;; Public functions

;; Start a new game session
(define-public (start-game)
  (begin
    (asserts! (var-get game-active) ERR-GAME-NOT-STARTED)
    (ok true)
  )
)

;; Finalize game score and calculate rewards
(define-public (finalize-game-score (score uint))
  (begin
    (asserts! (var-get game-active) ERR-GAME-NOT-STARTED)
    (asserts! (> score u0) ERR-INVALID-SCORE)
    
    (let (
      (player tx-sender)
      (current-level (default-to u1 (map-get? user-levels player)))
      (current-total-earned (default-to u0 (map-get? user-total-earned player)))
      (games-played (default-to u0 (map-get? user-games-played player)))
      (base-reward (* score (var-get reward-rate)))
      (level-bonus (* current-level u10)) ; 10% bonus per level
      (total-reward (+ base-reward level-bonus))
      (new-total-earned (+ current-total-earned total-reward))
      (new-games-played (+ games-played u1))
    )
      (begin
        ;; Update user data
        (map-set user-scores player score)
        (map-set user-total-earned player new-total-earned)
        (map-set user-games-played player new-games-played)
        
        ;; Check for level up (every 1000 points)
        (if (>= new-total-earned (* current-level u1000))
          (let ((new-level (+ current-level u1)))
            (begin
              (map-set user-levels player new-level)
              (ok (print (level-up player new-level)))
            )
          )
          (ok true)
        )
        
        ;; Mint rewards to player
        (try! (mint-tokens player total-reward))
        
        ;; Emit event
        (ok (print (game-completed player score total-reward)))
      )
    )
  )
)

;; Claim accumulated rewards
(define-public (claim-rewards)
  (let (
    (player tx-sender)
    (total-earned (default-to u0 (map-get? user-total-earned player)))
    (current-balance (default-to u0 (map-get? balances player)))
  )
    (begin
      (asserts! (> total-earned u0) ERR-INSUFFICIENT-BALANCE)
      
      ;; Reset total earned (rewards claimed)
      (map-set user-total-earned player u0)
      
      ;; Emit event
      (ok (print (reward-claimed player total-earned)))
    )
  )
)

;; Get user balance
(define-read-only (get-balance (player principal))
  (ok (default-to u0 (map-get? balances player)))
)

;; Get user level
(define-read-only (get-level (player principal))
  (ok (default-to u1 (map-get? user-levels player)))
)

;; Get user total earned
(define-read-only (get-total-earned (player principal))
  (ok (default-to u0 (map-get? user-total-earned player)))
)

;; Get user games played
(define-read-only (get-games-played (player principal))
  (ok (default-to u0 (map-get? user-games-played player)))
)

;; Get user high score
(define-read-only (get-high-score (player principal))
  (ok (default-to u0 (map-get? user-scores player)))
)

;; Get total supply
(define-read-only (get-total-supply)
  (ok (var-get total-supply))
)

;; Internal functions

;; Mint tokens to a player
(define-private (mint-tokens (to principal) (amount uint))
  (let (
    (current-balance (default-to u0 (map-get? balances to)))
    (new-balance (+ current-balance amount))
  )
    (begin
      (map-set balances to new-balance)
      (ok true)
    )
  )
)

;; Admin functions (only contract owner)

;; Set game active status
(define-public (set-game-active (active bool))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (var-set game-active active)
    (ok true)
  )
)

;; Set reward rate
(define-public (set-reward-rate (rate uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (var-set reward-rate rate)
    (ok true)
  )
)

;; Emergency withdraw (only for testing)
(define-public (emergency-withdraw (amount uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (let (
      (current-balance (default-to u0 (map-get? balances tx-sender)))
    )
      (begin
        (asserts! (>= current-balance amount) ERR-INSUFFICIENT-BALANCE)
        (map-set balances tx-sender (- current-balance amount))
        (ok true)
      )
    )
  )
)
